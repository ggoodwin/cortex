# build.ps1
# Script to clean node_modules and package-lock.json then reinstall dependencies

$ErrorActionPreference = "Stop"
$bars = "-------------------"

Write-Host $bars
Write-Host "🚀 We have lift off!"
Write-Host $bars
Write-Host ""

Write-Host $bars
Write-Host "📌 Cleanup Section 📌"
Write-Host $bars
Write-Host ""

# Remove node_modules directories if they exist
Write-Host "🧹 Cleaning up node_modules directories..."
$nodeDirs = @("node_modules", "packages/server/node_modules", "packages/web/node_modules", "packages/shared/node_modules")
foreach ($dir in $nodeDirs) {
    if (Test-Path $dir) {
        Write-Host "Removing $dir directory..."
        Remove-Item -Recurse -Force $dir
        Write-Host "✅ $dir removed"
    } else {
        Write-Host "ℹ️ $dir directory not found"
    }
}
Write-Host ""

# Remove tsconfig.tsbuildinfo if they exist
Write-Host "🧹 Cleaning up tsconfig.tsbuildinfo..."
$buildInfoFiles = @("packages/server/tsconfig.tsbuildinfo", "packages/web/tsconfig.tsbuildinfo", "packages/shared/tsconfig.tsbuildinfo")
foreach ($file in $buildInfoFiles) {
    if (Test-Path $file) {
        Write-Host "Removing $file..."
        Remove-Item -Force $file
        Write-Host "✅ $file removed"
    } else {
        Write-Host "ℹ️ $file not found"
    }
}
Write-Host ""

Write-Host "👏 Cleanup completed successfully!"
Write-Host ""

Write-Host $bars
Write-Host "📌 Installation Section 📌"
Write-Host $bars
Write-Host ""

# Run pnpm install
Write-Host "📦 Running pnpm install..."
Write-Host ""
pnpm install --frozen-lockfile

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ pnpm install completed successfully!"
} else {
    Write-Host "🧹 Running pnpm install without freeze..."
    pnpm install --no-frozen-lockfile
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ pnpm install completed successfully without freeze!"
    } else {
        Write-Host "❌ pnpm install still failed without freeze!"
        exit 1
    }
}
Write-Host ""

Write-Host "👏 Installation completed successfully!"
Write-Host ""

Write-Host $bars
Write-Host "📌 Typecheck Section 📌"
Write-Host $bars
Write-Host ""

# Run typecheck
Write-Host "🔍 Running typecheck..."
pnpm typecheck
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Typecheck failed!"
    exit 1
}

Write-Host "👏 Typecheck completed successfully!"
Write-Host ""

Write-Host $bars
Write-Host "📌 Lint Section 📌"
Write-Host $bars
Write-Host ""

# Run lint
Write-Host "🔍 Running lint..."
pnpm lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "🔍 Attempting to fix lint issues..."
    pnpm lint:fix
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Linting failed!"
        exit 1
    }
    Write-Host "✅ Lint issues fixed successfully!"
}

Write-Host "👏 Linting completed successfully!"
Write-Host ""

Write-Host $bars
Write-Host "📌 Test Section 📌"
Write-Host $bars
Write-Host ""

# Run tests
Write-Host "🧪 Running tests..."
pnpm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Some tests failed!"
    exit 1
}

Write-Host "👏 Testing completed successfully!"
Write-Host ""

Write-Host $bars
Write-Host "📌 Build Section 📌"
Write-Host $bars
Write-Host ""

# Remove dist directories if they exist
Write-Host "🧹 Cleaning up dist directories..."
$distDirs = @("packages/server/dist", "packages/web/dist", "packages/shared/dist")
foreach ($dir in $distDirs) {
    if (Test-Path $dir) {
        Write-Host "Removing $dir directory..."
        Remove-Item -Recurse -Force $dir
        Write-Host "✅ $dir removed"
    } else {
        Write-Host "ℹ️ $dir directory not found"
    }
}
Write-Host ""

# Build the project
Write-Host "🏗️  Building the project..."
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Project build failed!"
    exit 1
}

Write-Host "👏 Build completed successfully!"
Write-Host ""

# Final success message
Write-Host $bars
Write-Host "♥️ Landing Successful, we are green!"
Write-Host $bars
Write-Host ""
