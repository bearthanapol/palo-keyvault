# KeyVault - Secure API Key Management

A modern web-based credential vault service for Palo Alto Networks devices. Generate API keys instantly through a beautiful web interface or REST API.

## Features

- 🌐 **Modern Web Interface** - Beautiful, responsive UI for easy API key generation
- 🔐 **Secure Credential Management** - Centralized vault for device credentials
- 🚀 **Fast API** - RESTful API built with FastAPI
- 🐳 **Docker Ready** - Containerized for easy deployment
- 📊 **Real-time Status** - Live server health monitoring
- 💾 **Export Options** - Copy or download API keys

## Quick Start

### Using Docker (Recommended)

**Note:** Global Protect might interfere with Docker - you may need to disable it for the build.

```bash
# Build the Docker image
docker build --network=host -t keyvault .

# Start the server
docker run -p 8090:8090 keyvault
```

### Running Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Start the server
python keyvault.py
```

## Usage

### Web Interface

1. Open your browser and navigate to: `http://localhost:8090`
2. Enter a device IP address or select from available devices
3. Click "Generate API Key"
4. Copy or download the generated key

### REST API

You can also use the REST API directly:

```bash
# Generate API key for a device
curl "http://localhost:8090/deviceIp=13.214.235.85"

# Check server health
curl "http://localhost:8090/health"
```

**Example Response:**
```xml
<response status='success'>
  <result>
    <key>LUFRPT1hd3gwRzIzUm1ENFlMdlhaZldsY1hVSmFpU2M9...</key>
  </result>
</response>
```

## Testing with Global Protect

For testing with Global Protect VPN:
1. Connect to the Australia/Southeast region
2. Use the web interface or run:
```bash
curl "http://localhost:8090/deviceIp=4.199.3.115"
```

## Available Devices

The vault contains credentials for 16 devices across AWS and Azure:
- AWS Singapore region devices
- Azure devices
- Custom authentication configurations

View all available devices in the web interface.

## Deployment

### AWS ECR Deployment

```bash
# Tag the image
docker tag keyvault:latest 821395651130.dkr.ecr.ap-southeast-1.amazonaws.com/keyvault:v1.2

# Login to ECR
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 821395651130.dkr.ecr.ap-southeast-1.amazonaws.com

# Push to ECR
docker push 821395651130.dkr.ecr.ap-southeast-1.amazonaws.com/keyvault:v1.2
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Web interface |
| `/health` | GET | Health check |
| `/deviceIp={ip}` | GET | Generate API key for device |

## Technology Stack

- **Backend:** FastAPI, Python 3.11
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Container:** Docker
- **Server:** Uvicorn (ASGI)

## Security Notes

- SSL verification is disabled for self-signed certificates (common in firewall deployments)
- Credentials are stored in-memory (consider using environment variables or secret management for production)
- CORS is enabled for development (restrict origins in production)

## License

Internal use - Palo Alto Networks

## Author

jlee4@paloaltonetworks.com
