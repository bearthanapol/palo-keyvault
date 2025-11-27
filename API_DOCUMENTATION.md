# KeyVault API Documentation

## 🔌 API Endpoints

KeyVault provides both a **web interface** (requires authentication) and a **public API** (no authentication required) for machine-to-machine communication.

---

## 🌐 Public API Endpoints (No Authentication Required)

These endpoints are designed for programmatic access and **do not require authentication**.

### 1. Generate API Key

**Endpoint:** `GET /deviceIp={ip_address}`

**Description:** Generates an API key for a Palo Alto Networks device by IP address.

**Authentication:** ❌ **None required** - Publicly accessible

**Parameters:**
- `ip_address` (string, required) - The IP address of the device

**Example Request:**
```bash
curl "http://localhost:8090/deviceIp=13.214.235.85"
```

**Example Response:**
```xml
<response status='success'>
  <result>
    <key>LUFRPT1pSFlYYjFXRkxBZndRZXBjdTc1NFVZNGJHNWc9...</key>
  </result>
</response>
```

**Status Codes:**
- `200 OK` - API key generated successfully
- `400 Bad Request` - Invalid IP address format
- `404 Not Found` - IP not found in credential vault
- `502 Bad Gateway` - Failed to connect to device

---

### 2. Health Check

**Endpoint:** `GET /health`

**Description:** Check if the KeyVault service is running.

**Authentication:** ❌ **None required**

**Example Request:**
```bash
curl "http://localhost:8090/health"
```

**Example Response:**
```json
{
  "status": "healthy",
  "service": "KeyVault"
}
```

---

## 🔐 Protected Web Interface (Authentication Required)

These endpoints require password authentication and are accessed through a web browser.

### 1. Login Page

**Endpoint:** `GET /`

**Description:** Login page for web interface access

**Authentication:** ❌ None (this is the login page)

**Password:** `supp0rt@PS`

---

### 2. Main Application

**Endpoint:** `GET /app`

**Description:** Main web interface for managing API keys

**Authentication:** ✅ **Required** - Must login first

**Features:**
- Visual API key generation
- Device browser
- Copy/download functionality
- Server status monitoring

---

## 🚀 Deployment to Render

When deploying to Render, your API calls will change from:

```bash
# Local
curl "http://localhost:8090/deviceIp=13.214.235.85"
```

To:

```bash
# Production (example)
curl "https://your-app-name.onrender.com/deviceIp=13.214.235.85"
```

### Render Deployment Steps

1. **Push to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Add KeyVault web service"
   git push origin main
   ```

2. **Create New Web Service on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** `keyvault` (or your preferred name)
     - **Environment:** `Docker`
     - **Plan:** Free or paid
     - **Port:** `8090`

3. **Environment Variables** (Optional)
   - You can add `PORT=8090` if needed
   - Render will automatically detect the Dockerfile

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically

5. **Get Your URL**
   - After deployment, you'll get a URL like: `https://keyvault-xxxx.onrender.com`
   - Use this URL for API calls

---

## 📋 Available Devices

The following device IPs are registered in the vault:

| IP Address | Username | Region |
|------------|----------|--------|
| 13.214.235.85 | paloalto | AWS Singapore |
| 4.119.3.115 | jeremylee | AWS Singapore |
| 13.228.66.199 | paloalto | AWS Singapore |
| 18.136.129.38 | paloalto | AWS Singapore |
| 52.221.53.122 | paloalto | AWS Singapore |
| 54.254.134.147 | paloalto | AWS Singapore |
| 13.71.103.164 | panzadmins | Azure |
| 20.41.232.215 | panzadmins | Azure |
| 13.71.114.219 | panzadmins | Azure |
| 20.235.24.106 | panzadmins | Azure |
| 74.225.11.216 | panzadmins | Azure |
| 20.235.30.171 | panzadmins | Azure |
| 20.41.237.8 | panzadmins | Azure |
| 74.225.25.53 | panzadmins | Azure |
| 13.71.101.227 | panzadmins | Azure |
| 20.41.234.91 | panzadmins | Azure |

---

## 🔒 Security Model

### Public API (No Auth)
- ✅ `/deviceIp={ip}` - Generate API keys
- ✅ `/health` - Health check
- **Use Case:** Machine-to-machine communication, automation scripts, XSOAR playbooks

### Protected Web Interface (Auth Required)
- 🔐 `/` - Login page
- 🔐 `/app` - Main application
- **Use Case:** Human users who need to browse devices and generate keys manually

### Why This Design?

1. **API endpoints remain accessible** for automation and scripts
2. **Web interface is protected** to prevent unauthorized browsing of device information
3. **Best of both worlds** - secure UI, accessible API

---

## 💡 Usage Examples

### Python Script
```python
import requests

# No authentication needed for API endpoint
response = requests.get('http://localhost:8090/deviceIp=13.214.235.85')
print(response.text)
```

### Shell Script
```bash
#!/bin/bash
IP="13.214.235.85"
KEYVAULT_URL="http://localhost:8090"

# Get API key
API_KEY=$(curl -s "${KEYVAULT_URL}/deviceIp=${IP}" | grep -oP '(?<=<key>)[^<]+')
echo "API Key: ${API_KEY}"
```

### XSOAR Integration
```python
# In your XSOAR playbook
keyvault_url = "http://your-render-url.onrender.com"
device_ip = "13.214.235.85"

response = requests.get(f"{keyvault_url}/deviceIp={device_ip}")
# Parse XML response and extract key
```

---

## 📊 Summary

| Feature | Web Interface | API Endpoint |
|---------|--------------|--------------|
| **URL** | `/` and `/app` | `/deviceIp={ip}` |
| **Authentication** | ✅ Required | ❌ Not required |
| **Access Method** | Web Browser | HTTP/cURL/Scripts |
| **Use Case** | Manual browsing | Automation |
| **Response Format** | HTML | XML |

---

**Perfect for your use case!** 🎉
- Machines can call the API directly without authentication
- Humans use the protected web interface
- Deploy to Render and replace `localhost:8090` with your Render URL
