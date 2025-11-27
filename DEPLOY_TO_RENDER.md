# 🚀 How to Deploy KeyVault to Render

Your KeyVault application is fully configured for deployment on [Render](https://render.com). Follow these steps to get it running in minutes.

## Prerequisites

1. **GitHub Account**: You need to have this code pushed to a GitHub repository.
2. **Render Account**: Sign up at [render.com](https://render.com) (it's free).

---

## Step 1: Push Code to GitHub

If you haven't already, make sure all your latest changes are committed and pushed to GitHub.

```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "Prepare for Render deployment"

# Push to GitHub
git push origin main
```

---

## Step 2: Deploy on Render

### Option A: The Easy Way (Dashboard)

1. **Log in** to your [Render Dashboard](https://dashboard.render.com/).
2. Click the **"New +"** button and select **"Web Service"**.
3. **Connect your GitHub account** if you haven't already.
4. **Select your repository** (`keyvault`) from the list.
5. Configure the service:
   - **Name**: `keyvault` (or any unique name)
   - **Region**: Select the one closest to you (e.g., Singapore)
   - **Branch**: `main`
   - **Runtime**: **Docker** (Render should auto-detect this because of the `Dockerfile`)
   - **Instance Type**: **Free** (perfect for this app)
6. **Environment Variables**:
   - Render automatically sets a `PORT` variable. Your code is already written to use it!
   - You don't need to add anything extra unless you want to override defaults.
7. Click **"Create Web Service"**.

### Option B: The Blueprint Way (Infrastructure as Code)

1. In the Render Dashboard, click **"New +"** and select **"Blueprint"**.
2. Connect your repository.
3. Render will detect the `render.yaml` file I just created.
4. Click **"Apply"**.

---

## Step 3: Verify Deployment

1. Render will start building your Docker image. You can watch the logs in the dashboard.
2. Once the build finishes, it will deploy the service.
3. When you see **"Live"**, click the URL provided (e.g., `https://keyvault-xyz.onrender.com`).

---

## Step 4: Using Your Live App

### 🌍 Web Interface
- Go to `https://your-app-url.onrender.com`
- Login with password: `supp0rt@PS`

### 🤖 API (for Machines)
- Use the public endpoint: `https://your-app-url.onrender.com/deviceIp=13.214.235.85`
- No authentication required!

---

## 🔧 Troubleshooting

- **Build Failed?** Check the "Logs" tab in Render. Ensure your `requirements.txt` is correct.
- **App Crashing?** Your app listens on the port defined by the `PORT` environment variable. The code in `keyvault.py` handles this correctly:
  ```python
  port = int(os.getenv("PORT", 8090))
  ```
- **Health Check**: Render uses `/health` to verify the app is running. This is already configured in `render.yaml`.
