# Check if Firebase CLI is installed
if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host "Firebase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g firebase-tools
}

# Login to Firebase
Write-Host "Please login to Firebase in the browser window that opens..." -ForegroundColor Cyan
firebase login

# Deploy to Hosting
Write-Host "Deploying action.html to Firebase Hosting..." -ForegroundColor Cyan
firebase deploy --only hosting

Write-Host "Deployment Complete! You can now check https://auth.zeronux.store/action.html" -ForegroundColor Green
Read-Host "Press Enter to exit..."
