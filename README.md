# AGAI 5 marks coding Q for ST-2

An interactive coding practice platform and in-browser Python WebAssembly compiler for solving low-level Transformer implementations without external machine-learning libraries.

---

## 🚀 Quick Deployment to Render (2 Steps)

### Step 1: Push code to GitHub
```bash
git init
git add .
git commit -m "Initial commit - DeepLearn Judge"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to **[render.com](https://render.com/)** and log in.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Render will automatically detect the `Dockerfile` (or `render.yaml`).
5. Select **Free Instance Type** and click **Create Web Service**.
6. Your website will be live at `https://your-app-name.onrender.com`!

---

## 🐳 Run Locally with Docker

```bash
# Build the Docker image
docker build -t deeplearn-judge .

# Run the container locally on port 8080
docker run -d -p 8080:80 deeplearn-judge
```
Then open `http://localhost:8080` in your browser.
