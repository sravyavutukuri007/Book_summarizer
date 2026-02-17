from fastapi import FastAPI, UploadFile, File, Form, Header, HTTPException, Depends
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from io import BytesIO
from uuid import uuid4
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from typing import Optional
import os

from preprocessing import clean_text
from summarizer import generate_summary
import database

app = FastAPI(title="Intelligent Book Summarizer")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup():
    database.init_db()


# Pydantic models
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    is_admin: Optional[bool] = False


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str
    user: dict


# Authentication dependency
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.replace("Bearer ", "")
    user = database.validate_session(token)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return user


# Admin authentication dependency
async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# Authentication endpoints
@app.post("/api/auth/register", response_model=LoginResponse)
async def register(request: RegisterRequest):
    user_id = database.create_user(request.username, request.email, request.password, request.is_admin)

    if not user_id:
        raise HTTPException(status_code=400, detail="Username or email already exists")

    user = database.authenticate_user(request.username, request.password)
    token = database.create_session(user["id"])

    return {"token": token, "user": user}


@app.post("/api/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    user = database.authenticate_user(request.username, request.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = database.create_session(user["id"])
    return {"token": token, "user": user}


@app.post("/api/auth/logout")
async def logout(current_user: dict = Depends(get_current_user), authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    database.delete_session(token)
    return {"message": "Logged out successfully"}


@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


# Summary endpoints
@app.post("/api/summarize")
async def summarize(
    summary_type: str = Form(...),
    summary_length: int = Form(...),
    input_text: str = Form(""),
    file: UploadFile | None = File(None),
    current_user: dict = Depends(get_current_user)
):
    if input_text.strip():
        text = input_text
    elif file:
        content = await file.read()
        filename = file.filename.lower()

        if filename.endswith('.pdf'):
            try:
                from PyPDF2 import PdfReader
                pdf_reader = PdfReader(BytesIO(content))
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")
        else:
            text = content.decode("utf-8", errors="ignore")
    else:
        raise HTTPException(status_code=400, detail="No input provided")

    text = clean_text(text)
    summary = generate_summary(text, summary_type, summary_length)
    summary_id = str(uuid4())

    # Save to database
    database.save_summary(
        user_id=current_user["id"],
        summary_id=summary_id,
        original_text=text,
        summary_text=summary,
        summary_type=summary_type,
        summary_length=summary_length,
        word_count=len(summary.split())
    )

    return {
        "summary_id": summary_id,
        "summary": summary,
        "word_count": len(summary.split()),
        "summary_type": summary_type,
        "summary_length": summary_length,
        "download_links": {
            "txt": f"/api/download/{summary_id}?format=txt",
            "pdf": f"/api/download/{summary_id}?format=pdf"
        }
    }


@app.get("/api/summaries")
async def get_summaries(current_user: dict = Depends(get_current_user)):
    summaries = database.get_user_summaries(current_user["id"])
    return {"summaries": summaries}


@app.get("/api/download/{summary_id}")
async def download_summary(
    summary_id: str,
    format: str,
    current_user: dict = Depends(get_current_user)
):
    summary_data = database.get_summary_by_id(summary_id)

    if not summary_data:
        raise HTTPException(status_code=404, detail="Summary not found")

    # Check if user owns this summary or is admin
    if summary_data["user_id"] != current_user["id"] and not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Access denied")

    summary = summary_data["summary_text"]

    if format == "txt":
        buffer = BytesIO(summary.encode("utf-8"))
        return StreamingResponse(
            buffer,
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename=summary_{summary_id}.txt"}
        )

    if format == "pdf":
        buffer = BytesIO()
        styles = getSampleStyleSheet()
        doc = SimpleDocTemplate(buffer)
        doc.build([Paragraph(summary, styles["Normal"])])
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=summary_{summary_id}.pdf"}
        )

    raise HTTPException(status_code=400, detail="Invalid format")


# Admin endpoints
@app.get("/api/admin/users")
async def get_all_users(admin_user: dict = Depends(get_admin_user)):
    users = database.get_all_users()
    return {"users": users}


@app.get("/api/admin/summaries")
async def get_all_summaries(admin_user: dict = Depends(get_admin_user)):
    summaries = database.get_all_summaries_admin()
    return {"summaries": summaries}


@app.get("/api/admin/users/{user_id}/summaries")
async def get_user_summaries(user_id: int, admin_user: dict = Depends(get_admin_user)):
    summaries = database.get_user_summaries_admin(user_id)
    return {"summaries": summaries}


# Serve static files (frontend) - must be at the end
static_dir = "static"
if os.path.exists(static_dir):
    # Mount assets directory for CSS, JS, etc.
    app.mount("/assets", StaticFiles(directory=f"{static_dir}/assets"), name="assets")

# Catch-all route for SPA - must be at the very end
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Don't interfere with API routes
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")

    # Check if static directory exists
    if os.path.exists(static_dir):
        # Try to serve the requested file
        file_path = os.path.join(static_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)

        # For all other routes (SPA routing), serve index.html
        return FileResponse(os.path.join(static_dir, "index.html"))

    raise HTTPException(status_code=404, detail="Not found")
