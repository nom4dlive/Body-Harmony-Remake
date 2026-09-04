FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install notebooklm-py
RUN pip install --no-cache-dir notebooklm-py

COPY app.py .

EXPOSE 5055

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5055"]
