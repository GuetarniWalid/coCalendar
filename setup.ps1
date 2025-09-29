# coCalendar - Windows Setup Script (PowerShell)
# Run in PowerShell from repo root:  ./setup.ps1

function Test-Command($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Missing: $name" -ForegroundColor Red
    exit 1
  }
}

Write-Host '🚀 Setting up coCalendar (Windows) ...' -ForegroundColor Cyan

Write-Host '📋 Checking prerequisites...'
Test-Command node
Test-Command npm
Test-Command supabase
Test-Command deno
Test-Command npx

Write-Host '✅ Prerequisites OK' -ForegroundColor Green

# Create app directories
Write-Host '📁 Ensuring app directories exist...'
New-Item -ItemType Directory -Force -Path "app\src\types" | Out-Null

# Install mobile app deps
Write-Host '📦 Installing app dependencies...'
Push-Location "app"
try {
  npm install
  if (-not (Test-Path ".env")) {
    Write-Host '📝 Create app/.env with your Supabase credentials:' -ForegroundColor Yellow
    Write-Host '   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url' -ForegroundColor Yellow
    Write-Host '   EXPO_PUBLIC_SUPABASE_KEY=your_supabase_key' -ForegroundColor Yellow
  }
} finally {
  Pop-Location
}

# Supabase setup
Write-Host '🗄️ Supabase setup (Peer-to-Peer Model):' -ForegroundColor Yellow
Write-Host '   For CLOUD: cd supabase && supabase db push' -ForegroundColor Yellow  
Write-Host '   For LOCAL: cd supabase && supabase start && supabase db reset --debug' -ForegroundColor Yellow

# Edge Functions
Write-Host '⚡ Deploy Edge Functions:' -ForegroundColor Yellow
Write-Host '   supabase functions deploy send_reminders' -ForegroundColor Yellow
Write-Host '   supabase functions deploy redeem_invite' -ForegroundColor Yellow
Write-Host '   supabase functions deploy monthly_recap' -ForegroundColor Yellow

# Auth setup
Write-Host '🔐 Configure Supabase Auth Redirect URLs:' -ForegroundColor Yellow
Write-Host '   cocalendar://auth/callback' -ForegroundColor Yellow
Write-Host '   (Your Expo dev URL will be generated automatically)' -ForegroundColor Yellow

# Start app
Write-Host '🚀 Start the app:' -ForegroundColor Yellow
Write-Host '   cd app && npm run start' -ForegroundColor Yellow

Write-Host '✅ Setup script finished. See README.md for complete details.' -ForegroundColor Green
