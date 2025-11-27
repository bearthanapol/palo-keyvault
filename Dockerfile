# Use an official Python runtime as a parent image
# Slim variant is smaller and has fewer vulnerabilities
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY keyvault.py .
COPY static/ ./static/

# Expose the port (informative only, strictly speaking)
EXPOSE 8090
# Define environment variable for the port (can be overridden at runtime)
ENV PORT=8090

# Run the application
CMD ["python", "keyvault.py"]
