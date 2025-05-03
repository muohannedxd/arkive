FROM python:3.11-slim

WORKDIR /app

# Install dependencies and wait-for-it script
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    apt-get update && \
    apt-get install -y netcat-openbsd && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy application code
COPY app/ app/
COPY .env .env

# Create a script to check kafka availability and start the service
RUN echo '#!/bin/bash\n\
echo "Waiting for Kafka to be ready..."\n\
max_retries=30\n\
retry_count=0\n\
while [ $retry_count -lt $max_retries ]; do\n\
  if nc -z kafka 29092; then\n\
    echo "Kafka is available!"\n\
    break\n\
  fi\n\
  echo "Kafka is not available yet. Retrying..."\n\
  retry_count=$((retry_count+1))\n\
  sleep 2\n\
done\n\
\n\
if [ $retry_count -eq $max_retries ]; then\n\
  echo "Failed to connect to Kafka within the retry limit. Starting anyway..."\n\
fi\n\
\n\
# Start uvicorn server with FastKafka integration\n\
exec uvicorn app.main:app --host 0.0.0.0 --port 8000\n\
' > /app/start.sh

RUN chmod +x /app/start.sh

# Run the start script
CMD ["/app/start.sh"]