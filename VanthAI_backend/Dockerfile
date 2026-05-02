FROM python:3.12-slim

WORKDIR /app

# System deps for psycopg binary
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
RUN pip install --no-cache-dir --upgrade pip setuptools wheel
COPY pyproject.toml .
RUN pip install --no-cache-dir \
    fastapi==0.136.1 \
    uvicorn[standard]==0.46.0 \
    websockets==15.0.1 \
    pydantic==2.11.4 \
    pydantic-settings==2.9.1 \
    langgraph==1.1.9 \
    langchain-core==1.3.2 \
    langchain-google-genai==4.2.2 \
    langchain-openai==1.1.12 \
    psycopg[binary,pool]==3.3.3 \
    sqlalchemy[asyncio]==2.0.49 \
    redis==6.1.0 \
    python-dotenv==1.1.0 \
    structlog==25.4.0 \
    httpx==0.28.1

# Copy application code
COPY . .

# KB directory will be mounted at /app/KB at runtime (read-only)
# See docker-compose.yml volumes section

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
