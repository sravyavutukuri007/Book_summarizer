# =========================================
# Stage 1: Frontend (NO BUILD STEP)
# =========================================
FROM node:18-alpine AS frontend

WORKDIR /app/frontend

# Copy frontend files directly
COPY frontend/ .


# =========================================
# Stage 2: Backend + Frontend
# =========================================
FROM python:3.11-slim

WORKDIR /app

# Install bash (needed for start script)
RUN apt-get update && \
    apt-get install -y --no-install-recommends bash && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files
COPY *.py ./

# Copy frontend files
COPY --from=frontend /app/frontend ./static

# Startup script
RUN printf '#!/bin/bash\n\
echo \"================================\"\n\
echo \"Book Summarizer - Starting...\"\n\
echo \"================================\"\n\
echo \"Application: http://localhost:8000\"\n\
echo \"================================\"\n\
uvicorn api:app --host 0.0.0.0 --port 8000\n' > start.sh \
 && chmod +x start.sh

EXPOSE 8000

CMD ["./start.sh"]