# 📥 CSV Import & Device Management Guide

## ✨ New Features

We've supercharged the device management with powerful new tools!

### 🔍 Search & Filter
- **Real-time Search**: Type in the search box to instantly filter devices by IP or username.
- **Clear Results**: Delete the search text to see all devices again.

### ☑️ Bulk Selection
- **Select All**: Click the checkbox next to "Select All" to select every visible device.
- **Individual Selection**: Click the checkbox on any device card to select it.
- **Smart Selection**: "Select All" respects your current search filter!

### 🗑️ Bulk Delete
- **Delete Selected**: Once you select devices, a red "Delete Selected" button appears.
- **Safety First**: You'll always be asked for confirmation before deleting.

### 📄 CSV Import

You can now bulk import devices using a CSV file!

#### CSV Format
The file should be a standard `.csv` file with 3 columns:
1. **IP Address**
2. **Username**
3. **Password**

**Example `devices.csv`:**
```csv
IP Address,Username,Password
192.168.1.100,admin,secret123
10.0.0.5,paloalto,Palo@123
172.16.0.1,firewall_admin,ChangeMe!
```

#### How to Import
1. Click the **"Import CSV"** button (top right of Available Devices).
2. Select your `.csv` file.
3. The system will:
   - ✅ Validate every row
   - 🚫 Skip duplicates (based on IP)
   - ⚠️ Report any errors
   - 🎉 Add all valid devices instantly!

---

### 🚀 Try it out!
We've included a sample file `example_devices.csv` in the repository for you to test with.
