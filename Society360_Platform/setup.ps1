# Society360 Platform - Quick Setup Script

Write-Host "🚀 Society360 Platform Setup" -ForegroundColor Cyan
Write-Host "============================`n" -ForegroundColor Cyan

# Check if PostgreSQL is running
Write-Host "1️⃣  Checking PostgreSQL..." -ForegroundColor Yellow
try {
    $pgStatus = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgStatus) {
        Write-Host "   ✅ PostgreSQL service found" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  PostgreSQL service not found. Please ensure PostgreSQL is installed and running." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ⚠️  Could not check PostgreSQL status" -ForegroundColor Yellow
}

# Reset and seed database
Write-Host "`n2️⃣  Resetting database..." -ForegroundColor Yellow
Set-Location backend
node database/reset_database.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Database reset failed!" -ForegroundColor Red
    exit 1
}
Set-Location ..

# Install backend dependencies
Write-Host "`n3️⃣  Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
if (!(Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "   ✅ Backend dependencies already installed" -ForegroundColor Green
}
Set-Location ..

# Install frontend dependencies
Write-Host "`n4️⃣  Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
if (!(Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "   ✅ Frontend dependencies already installed" -ForegroundColor Green
}
Set-Location ..

Write-Host "`n✨ Setup Complete!" -ForegroundColor Green
Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Start backend:  cd backend && npm start" -ForegroundColor White
Write-Host "   2. Start frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "   3. Open browser:   http://localhost:3000/login" -ForegroundColor White
Write-Host "`n🔐 Demo Credentials:" -ForegroundColor Cyan
Write-Host "   Admin:    admin@society360.com / admin123" -ForegroundColor White
Write-Host "   Staff:    staff@society360.com / staff123" -ForegroundColor White
Write-Host "   Resident: resident@society360.com / resident123" -ForegroundColor White
Write-Host ""
