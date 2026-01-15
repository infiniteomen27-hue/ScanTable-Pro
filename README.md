
# ScanTable Pro Deployment Guide

To deploy this app to Vercel:

1. **Push to GitHub**: Upload all your files to a GitHub repository.
2. **Import to Vercel**: 
   - Log in to [Vercel](https://vercel.com).
   - Click **New Project** and select your repository.
3. **Set Environment Variables**:
   - In the **Environment Variables** section of the deployment settings, add:
     - **Key**: `API_KEY`
     - **Value**: `YOUR_GEMINI_API_KEY`
4. **Deploy**: Click the **Deploy** button.

Once deployed, your app will be accessible via a public `.vercel.app` URL.
