from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from io import BytesIO
from uuid import uuid4
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

from .preprocessing import clean_text
from .summarizer import generate_summary

app = FastAPI(title="Intelligent Book Summarizer")

# In-memory store (temporary)
SUMMARY_STORE = {}


@app.post("/summarize")
async def summarize(
    summary_type: str = Form(...),
    summary_length: int = Form(...),
    input_text: str = Form(""),
    file: UploadFile | None = File(None)
):
    if input_text.strip():
        text = input_text
    elif file:
        content = await file.read()
        text = content.decode("utf-8", errors="ignore")
    else:
        return {"error": "No input provided"}

    text = clean_text(text)
    summary = generate_summary(text, summary_type, summary_length)

    summary_id = str(uuid4())
    SUMMARY_STORE[summary_id] = summary

    return {
        "summary": summary,
        "word_count": len(summary.split()),
        "download_links": {
            "txt": f"/download/{summary_id}?format=txt",
            "pdf": f"/download/{summary_id}?format=pdf"
        }
    }


@app.get("/download/{summary_id}")
async def download_summary(summary_id: str, format: str):
    summary = SUMMARY_STORE.get(summary_id)

    if not summary:
        return {"error": "Summary expired or not found"}

    if format == "txt":
        buffer = BytesIO(summary.encode("utf-8"))
        return StreamingResponse(
            buffer,
            media_type="text/plain",
            headers={"Content-Disposition": "attachment; filename=summary.txt"}
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
            headers={"Content-Disposition": "attachment; filename=summary.pdf"}
        )

    return {"error": "Invalid format"}
