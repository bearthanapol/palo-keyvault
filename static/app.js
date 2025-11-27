// ===== Authentication Check =====
const SESSION_KEY = 'keyvault_authenticated';

// Check if user is authenticated
if (sessionStorage.getItem(SESSION_KEY) !== 'true') {
    window.location.href = '/';
}

// ===== Configuration =====
const API_BASE_URL = window.location.origin;

// Available devices (synced with backend)
const AVAILABLE_DEVICES = [
    { ip: "13.214.235.85", username: "paloalto" },
    { ip: "4.119.3.115", username: "jeremylee" },
    { ip: "13.228.66.199", username: "paloalto" },
    { ip: "18.136.129.38", username: "paloalto" },
    { ip: "52.221.53.122", username: "paloalto" },
    { ip: "54.254.134.147", username: "paloalto" },
    { ip: "13.71.103.164", username: "panzadmins" },
    { ip: "20.41.232.215", username: "panzadmins" },
    { ip: "13.71.114.219", username: "panzadmins" },
    { ip: "20.235.24.106", username: "panzadmins" },
    { ip: "74.225.11.216", username: "panzadmins" },
    { ip: "20.235.30.171", username: "panzadmins" },
    { ip: "20.41.237.8", username: "panzadmins" },
    { ip: "74.225.25.53", username: "panzadmins" },
    { ip: "13.71.101.227", username: "panzadmins" },
    { ip: "20.41.234.91", username: "panzadmins" }
];

// ===== DOM Elements =====
const elements = {
    form: document.getElementById('keygenForm'),
    ipInput: document.getElementById('ipAddress'),
    generateBtn: document.getElementById('generateBtn'),
    quickSelectBtn: document.getElementById('quickSelectBtn'),
    quickSelectDropdown: document.getElementById('quickSelectDropdown'),
    resultCard: document.getElementById('resultCard'),
    resultStatus: document.getElementById('resultStatus'),
    resultContent: document.getElementById('resultContent'),
    resultActions: document.getElementById('resultActions'),
    closeResultBtn: document.getElementById('closeResultBtn'),
    copyBtn: document.getElementById('copyBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    devicesGrid: document.getElementById('devicesGrid'),
    serverStatus: document.getElementById('serverStatus'),
    toastContainer: document.getElementById('toastContainer'),
    logoutBtn: document.getElementById('logoutBtn'),
    addDeviceBtn: document.getElementById('addDeviceBtn'),
    addDeviceModal: document.getElementById('addDeviceModal'),
    addDeviceForm: document.getElementById('addDeviceForm'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    cancelAddBtn: document.getElementById('cancelAddBtn'),
    newDeviceIp: document.getElementById('newDeviceIp'),
    newDeviceUsername: document.getElementById('newDeviceUsername'),
    newDevicePassword: document.getElementById('newDevicePassword')
};

// ===== State Management =====
let currentApiKey = null;
let currentIp = null;

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    populateQuickSelect();
    renderDevices();
    checkServerStatus();
}

// ===== Event Listeners =====
function setupEventListeners() {
    elements.form.addEventListener('submit', handleFormSubmit);
    elements.quickSelectBtn.addEventListener('click', toggleQuickSelect);
    elements.closeResultBtn.addEventListener('click', hideResultCard);
    elements.copyBtn.addEventListener('click', copyApiKey);
    elements.downloadBtn.addEventListener('click', downloadApiKey);
    elements.logoutBtn.addEventListener('click', handleLogout);
    elements.addDeviceBtn.addEventListener('click', openAddDeviceModal);
    elements.closeModalBtn.addEventListener('click', closeAddDeviceModal);
    elements.cancelAddBtn.addEventListener('click', closeAddDeviceModal);
    elements.addDeviceForm.addEventListener('submit', handleAddDevice);

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.input-wrapper')) {
            closeQuickSelect();
        }
    });

    // Close modal when clicking outside
    elements.addDeviceModal.addEventListener('click', (e) => {
        if (e.target === elements.addDeviceModal) {
            closeAddDeviceModal();
        }
    });
}

// ===== Logout Handler =====
function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = '/';
    }, 500);
}

// ===== Quick Select Dropdown =====
function populateQuickSelect() {
    elements.quickSelectDropdown.innerHTML = AVAILABLE_DEVICES.map(device => `
        <div class="dropdown-item" data-ip="${device.ip}">
            <div class="dropdown-item-ip">${device.ip}</div>
            <div class="dropdown-item-user">${device.username}</div>
        </div>
    `).join('');

    // Add click handlers to dropdown items
    elements.quickSelectDropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            const ip = item.dataset.ip;
            elements.ipInput.value = ip;
            closeQuickSelect();
            showToast('Device selected', 'info');
        });
    });
}

function toggleQuickSelect() {
    const isActive = elements.quickSelectDropdown.classList.toggle('active');
    elements.quickSelectBtn.classList.toggle('active', isActive);
}

function closeQuickSelect() {
    elements.quickSelectDropdown.classList.remove('active');
    elements.quickSelectBtn.classList.remove('active');
}

// ===== Form Handling =====
async function handleFormSubmit(e) {
    e.preventDefault();

    const ipAddress = elements.ipInput.value.trim();

    if (!validateIpAddress(ipAddress)) {
        showToast('Please enter a valid IP address', 'error');
        return;
    }

    await generateApiKey(ipAddress);
}

function validateIpAddress(ip) {
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(ip);
}

// ===== API Key Generation =====
async function generateApiKey(ipAddress) {
    setLoadingState(true);
    hideResultCard();

    try {
        const response = await fetch(`${API_BASE_URL}/deviceIp=${ipAddress}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.text();

        // Parse the API key from XML response
        const keyMatch = data.match(/<key>(.*?)<\/key>/);
        const statusMatch = data.match(/status\s*=\s*['"]([^'"]+)['"]/);

        if (statusMatch && statusMatch[1] === 'success' && keyMatch) {
            currentApiKey = keyMatch[1];
            currentIp = ipAddress;
            showResult(true, data, ipAddress);
            showToast('API key generated successfully!', 'success');
        } else {
            throw new Error('Failed to extract API key from response');
        }

    } catch (error) {
        console.error('Error generating API key:', error);
        showResult(false, error.message, ipAddress);
        showToast(`Error: ${error.message}`, 'error');
    } finally {
        setLoadingState(false);
    }
}

// ===== UI State Management =====
function setLoadingState(isLoading) {
    elements.generateBtn.disabled = isLoading;
    elements.generateBtn.classList.toggle('loading', isLoading);
    elements.ipInput.disabled = isLoading;
}

function showResult(success, content, ipAddress) {
    elements.resultCard.style.display = 'block';
    elements.resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Update status
    elements.resultStatus.className = `result-status ${success ? 'success' : 'error'}`;
    elements.resultStatus.innerHTML = success
        ? `✓ Successfully generated API key for ${ipAddress}`
        : `✗ Failed to generate API key for ${ipAddress}`;

    // Update content
    elements.resultContent.textContent = content;

    // Show/hide actions
    elements.resultActions.style.display = success ? 'flex' : 'none';
}

function hideResultCard() {
    elements.resultCard.style.display = 'none';
    currentApiKey = null;
    currentIp = null;
}

// ===== Copy & Download Functions =====
async function copyApiKey() {
    if (!currentApiKey) return;

    try {
        await navigator.clipboard.writeText(currentApiKey);
        showToast('API key copied to clipboard!', 'success');
    } catch (error) {
        console.error('Failed to copy:', error);
        showToast('Failed to copy API key', 'error');
    }
}

function downloadApiKey() {
    if (!currentApiKey || !currentIp) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `apikey_${currentIp}_${timestamp}.txt`;
    const content = `API Key for ${currentIp}\nGenerated: ${new Date().toLocaleString()}\n\n${currentApiKey}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('API key downloaded!', 'success');
}

// ===== Devices Grid =====
function renderDevices() {
    elements.devicesGrid.innerHTML = AVAILABLE_DEVICES.map(device => `
        <div class="device-item" data-ip="${device.ip}">
            <div class="device-content">
                <div class="device-ip">${device.ip}</div>
                <div class="device-user">${device.username}</div>
            </div>
            <button class="device-delete-btn" data-ip="${device.ip}" title="Delete device">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
    `).join('');

    // Add click handlers for selecting devices
    elements.devicesGrid.querySelectorAll('.device-item').forEach(item => {
        const deviceContent = item.querySelector('.device-content');
        deviceContent.addEventListener('click', () => {
            const ip = item.dataset.ip;
            elements.ipInput.value = ip;
            elements.ipInput.focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast(`Selected ${ip}`, 'info');
        });
    });

    // Add click handlers for delete buttons
    elements.devicesGrid.querySelectorAll('.device-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent device selection
            const ip = btn.dataset.ip;
            handleDeleteDevice(ip);
        });
    });
}

// ===== Server Status Check =====
async function checkServerStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            cache: 'no-cache'
        });

        const isOnline = response.ok;
        updateServerStatus(isOnline);
    } catch (error) {
        updateServerStatus(false);
    }
}

function updateServerStatus(isOnline) {
    elements.serverStatus.classList.toggle('online', isOnline);
    elements.serverStatus.classList.toggle('offline', !isOnline);

    const statusText = elements.serverStatus.querySelector('.status-text');
    statusText.textContent = isOnline ? 'Server Online' : 'Server Offline';
}

// ===== Toast Notifications =====
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div style="flex: 1;">${message}</div>
    `;

    elements.toastContainer.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// ===== Utility Functions =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== Add Device Modal =====
function openAddDeviceModal() {
    elements.addDeviceModal.classList.add('active');
    elements.newDeviceIp.focus();
}

function closeAddDeviceModal() {
    elements.addDeviceModal.classList.remove('active');
    elements.addDeviceForm.reset();
}

async function handleAddDevice(e) {
    e.preventDefault();

    const newDevice = {
        ip: elements.newDeviceIp.value.trim(),
        username: elements.newDeviceUsername.value.trim(),
        password: elements.newDevicePassword.value
    };

    // Validate IP
    if (!validateIpAddress(newDevice.ip)) {
        showToast('Please enter a valid IP address', 'error');
        return;
    }

    // Check if device already exists
    const exists = AVAILABLE_DEVICES.some(device => device.ip === newDevice.ip);
    if (exists) {
        showToast('Device with this IP already exists', 'error');
        return;
    }

    // Add device to the list
    AVAILABLE_DEVICES.push({
        ip: newDevice.ip,
        username: newDevice.username
    });

    // Update UI
    renderDevices();
    populateQuickSelect();

    // Close modal
    closeAddDeviceModal();

    // Show success message
    showToast(`Device ${newDevice.ip} added successfully!`, 'success');

    // Note: In a real application, you would send this to the backend
    // For now, we're just adding it to the frontend list
    console.log('New device added:', newDevice);

    // TODO: Send to backend
    // await addDeviceToBackend(newDevice);
}

// ===== Delete Device =====
function handleDeleteDevice(ip) {
    // Find device info for confirmation message
    const device = AVAILABLE_DEVICES.find(d => d.ip === ip);
    if (!device) return;

    // Show confirmation dialog
    const confirmed = confirm(`Are you sure you want to delete device?\n\nIP: ${ip}\nUsername: ${device.username}\n\nThis action cannot be undone.`);

    if (!confirmed) return;

    // Find index and remove from array
    const index = AVAILABLE_DEVICES.findIndex(d => d.ip === ip);
    if (index > -1) {
        AVAILABLE_DEVICES.splice(index, 1);

        // Update UI
        renderDevices();
        populateQuickSelect();

        // Show success message
        showToast(`Device ${ip} deleted successfully`, 'success');

        // Note: In a real application, you would send this to the backend
        console.log('Device deleted:', ip);

        // TODO: Send to backend
        // await deleteDeviceFromBackend(ip);
    }
}

// Check server status periodically
setInterval(checkServerStatus, 30000); // Every 30 seconds
