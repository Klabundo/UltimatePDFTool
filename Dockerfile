FROM public.ecr.aws/docker/library/python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY server.py .
COPY pdf_tool.py .

# Expose port
EXPOSE 8000

# Start the server
CMD ["python", "server.py"]
