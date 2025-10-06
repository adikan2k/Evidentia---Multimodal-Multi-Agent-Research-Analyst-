FROM python:3.11-slim

# System deps (psql client optional, useful for debug)
RUN apt-get update && apt-get install -y build-essential curl && rm -rf /var/lib/apt/lists/*

# Workdir
WORKDIR /app

# Copy requirements first (better cache)
COPY app/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the app
COPY app /app

# Env (FastAPI/uvicorn)
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Expose (platforms like Render inject PORT; we respect it below)
EXPOSE 8080

# Start server (use $PORT if provided; default 8080)
CMD ["sh", "-lc", "python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
