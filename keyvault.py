import os
import ipaddress
import requests
from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import urllib3

# jlee4@paloaltonetworks.com

# Suppress InsecureRequestWarning since firewalls often use self-signed certs
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Initialize the API
app = FastAPI(title="KeyVault - Secure API Key Management")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Mock database of credentials indexed by IP
IP_CREDENTIALS = {
    "13.214.235.85": ("paloalto",'supp0rt@PS'),
    "4.119.3.115": ("jeremylee",'xD37J5mpC8d9s#Vr4u0A'),
    "13.228.66.199": ("paloalto",'supp0rt@PS'),
    "18.136.129.38": ("paloalto",'supp0rt@PS'),
    "52.221.53.122": ("paloalto",'supp0rt@PS'),
    "54.254.134.147": ("paloalto",'supp0rt@PS'),
    "13.71.103.164": ("panzadmins",'Palo@123'),
    "20.41.232.215": ("panzadmins",'Palo@123'),
    "13.71.114.219": ("panzadmins",'Palo@123'),
    "20.235.24.106": ("panzadmins",'Palo@123'),
    "74.225.11.216": ("panzadmins",'Palo@123'),
    "20.235.30.171": ("panzadmins",'Palo@123'), 
    "20.41.237.8": ("panzadmins",'Palo@123'),
    "74.225.25.53": ("panzadmins",'Palo@123'),
    "13.71.101.227": ("panzadmins",'Palo@123'),
    "20.41.234.91": ("panzadmins",'Palo@123')
}

@app.get("/", response_class=FileResponse)
def serve_login_page():
    """
    Serve the login page
    """
    static_dir = os.path.join(os.path.dirname(__file__), "static")
    login_path = os.path.join(static_dir, "login.html")
    
    if os.path.exists(login_path):
        return FileResponse(login_path)
    else:
        raise HTTPException(status_code=404, detail="Login page not found")

@app.get("/app", response_class=FileResponse)
def serve_web_interface():
    """
    Serve the main web interface (requires authentication)
    """
    static_dir = os.path.join(os.path.dirname(__file__), "static")
    app_path = os.path.join(static_dir, "app.html")
    
    if os.path.exists(app_path):
        return FileResponse(app_path)
    else:
        raise HTTPException(status_code=404, detail="Web interface not found")

@app.get("/health")
def health_check():
    """
    Health check endpoint for monitoring server status
    """
    return {"status": "healthy", "service": "KeyVault"}

@app.get("/deviceIp={ip_address}", response_class=PlainTextResponse)
def get_device_api_key(ip_address: str):
    """
    1. Validates the IP.
    2. Looks up credentials.
    3. Connects to the device to generate an API key.
    4. Returns the raw response from the device.
    """
    # 1. Validate IP
    try:
        ip_obj = ipaddress.ip_address(ip_address)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid IP address format")
        
    # 2. Look up credentials
    if ip_address not in IP_CREDENTIALS:
        raise HTTPException(status_code=404, detail="IP not found in credential vault")
        
    username, password = IP_CREDENTIALS[ip_address]
    
    # 3. Request API Key from the Firewall/Panorama
    # URL structure: https://[IP]/api/?type=keygen
    url = f"https://{ip_address}/api/?type=keygen"
    
    # Payload for application/x-www-form-urlencoded
    payload = {
        'user': username,
        'password': password
    }
    
    print(f"Connecting to {ip_address} as {username}...")

    try:
        # verify=False is used because appliances often have self-signed certs
        # timeout=10 prevents the server from hanging indefinitely
        response = requests.post(url, data=payload, verify=False, timeout=10)
        
        # Check if the connection itself was successful (200 OK)
        response.raise_for_status()
        
        # Return the XML body (which contains the key)
        return response.text
        
    except requests.exceptions.RequestException as e:
        # Handles timeouts, connection refused, etc.
        print(f"Connection failed: {e}")
        raise HTTPException(status_code=502, detail=f"Failed to connect to device: {str(e)}")

from pydantic import BaseModel

class Device(BaseModel):
    ip: str
    username: str
    password: str

@app.post("/add-device")
def add_device(device: Device):
    """
    Add a new device to the in-memory credential vault.
    """
    # Validate IP
    try:
        ipaddress.ip_address(device.ip)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid IP address format")
    
    # Add to credentials
    IP_CREDENTIALS[device.ip] = (device.username, device.password)
    
    return {"status": "success", "message": f"Device {device.ip} added to vault"}

@app.delete("/delete-device/{ip_address}")
def delete_device(ip_address: str):
    """
    Remove a device from the in-memory credential vault.
    """
    if ip_address in IP_CREDENTIALS:
        del IP_CREDENTIALS[ip_address]
        return {"status": "success", "message": f"Device {ip_address} deleted from vault"}
    else:
        raise HTTPException(status_code=404, detail="Device not found")

if __name__ == "__main__":
    # Get port from environment variable or default to 8090
    port = int(os.getenv("PORT", 8090))
    print(f"Starting KeyVault on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
