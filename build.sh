#!/bin/bash

# build.sh
# Script to clean node_modules and package-lock.json then reinstall dependencies

bars="-------------------"

echo "$bars"
echo "🚀 We have lift off!"
echo "$bars"
echo

echo "$bars"
echo "📌 Cleanup Section 📌"
echo "$bars"
echo

# Remove node_modules directory if it exists
echo "🧹 Cleaning up node_modules directories..."
if [[ -d "node_modules" ]]; then
    echo "Removing node_modules directory..."
    rm -rf node_modules
    echo "✅ node_modules removed"
else
    echo "ℹ️ node_modules directory not found"
fi

if [[ -d "packages/server/node_modules" ]]; then
    echo "Removing server node_modules directory..."
    rm -rf packages/server/node_modules
    echo "✅ server node_modules removed"
else
    echo "ℹ️ server node_modules directory not found"
fi

if [[ -d "packages/web/node_modules" ]]; then
    echo "Removing web node_modules directory..."
    rm -rf packages/web/node_modules
    echo "✅ web node_modules removed"
else
    echo "ℹ️ web node_modules directory not found"
fi

if [[ -d "packages/shared/node_modules" ]]; then
    echo "Removing shared node_modules directory..."
    rm -rf packages/shared/node_modules
    echo "✅ shared node_modules removed"
else
    echo "ℹ️ shared node_modules directory not found"
fi
echo

# Remove tsconfig.tsbuildinfo if it exists
echo "🧹 Cleaning up tsconfig.tsbuildinfo..."
if [[ -f "packages/server/tsconfig.tsbuildinfo" ]]; then
    echo "Removing server tsconfig.tsbuildinfo..."
    rm packages/server/tsconfig.tsbuildinfo
    echo "✅ server tsconfig.tsbuildinfo removed"
else
    echo "ℹ️ server tsconfig.tsbuildinfo not found"
fi

if [[ -f "packages/web/tsconfig.tsbuildinfo" ]]; then
    echo "Removing web tsconfig.tsbuildinfo..."
    rm packages/web/tsconfig.tsbuildinfo
    echo "✅ web tsconfig.tsbuildinfo removed"
else
    echo "ℹ️ web tsconfig.tsbuildinfo not found"
fi

if [[ -f "packages/shared/tsconfig.tsbuildinfo" ]]; then
    echo "Removing shared tsconfig.tsbuildinfo..."
    rm packages/shared/tsconfig.tsbuildinfo
    echo "✅ shared tsconfig.tsbuildinfo removed"
else
    echo "ℹ️ shared tsconfig.tsbuildinfo not found"
fi
echo

echo "👏 Cleanup completed successfully!"
echo

echo "$bars"
echo "📌 Installation Section 📌"
echo "$bars"
echo

# Run pnpm install
echo "📦 Running pnpm install..."
echo
pnpm install --frozen-lockfile

if [[ $? -eq 0 ]]; then
    echo "✅ pnpm install completed successfully!"
else
    echo "🧹 Running pnpm install without freeze..."
    pnpm install --no-frozen-lockfile
    if [[ $? -eq 0 ]]; then
        echo "✅ pnpm install completed successfully without freeze!"
    else
        echo "❌ pnpm install still failed without freeze!"
        exit 1
    fi
fi
echo

echo "👏 Installation completed successfully!"
echo

echo "$bars"
echo "📌 Typecheck Section 📌"
echo "$bars"
echo

# Run typecheck
echo "🔍 Running typecheck..."
pnpm typecheck
if [[ $? -eq 0 ]]; then
    echo "✅ Typecheck completed successfully!"
else
    echo "❌ Typecheck failed!"
    exit 1
fi

echo "👏 Typecheck completed successfully!"
echo

echo "$bars"
echo "📌 Lint Section 📌"
echo "$bars"
echo

# Run lint
echo "🔍 Running lint..."
pnpm lint
if [[ $? -eq 0 ]]; then
    echo "✅ Linting completed successfully!"
else
    echo "🔍 Attempting to fix lint issues..."
    pnpm lint:fix
    if [[ $? -eq 0 ]]; then
        echo "✅ Lint issues fixed successfully!"
    else
        echo "❌ Linting failed!"
        exit 1
    fi
fi
echo

echo "👏 Linting completed successfully!"
echo

echo "$bars"
echo "📌 Test Section 📌"
echo "$bars"
echo

# Run tests
echo "🧪 Running tests..."
pnpm test
if [[ $? -eq 0 ]]; then
    echo "✅ All tests passed successfully!"
else
    echo "❌ Some tests failed!"
    exit 1
fi
echo

echo "👏 Testing completed successfully!"
echo

echo $bars
echo "📌 Build Section 📌"
echo $bars
echo

# Remove dist directories if they exist
echo "🧹 Cleaning up dist directories..."
if [[ -d "packages/server/dist" ]]; then
    echo "Removing server dist directory..."
    rm -rf packages/server/dist
    echo "✅ server dist directory removed"
else
    echo "ℹ️ server dist directory not found"
fi

if [[ -d "packages/web/dist" ]]; then
    echo "Removing web dist directory..."
    rm -rf packages/web/dist
    echo "✅ web dist directory removed"
else
    echo "ℹ️ web dist directory not found"
fi

if [[ -d "packages/shared/dist" ]]; then
    echo "Removing shared dist directory..."
    rm -rf packages/shared/dist
    echo "✅ shared dist directory removed"
else
    echo "ℹ️ shared dist directory not found"
fi
echo

# Build the project
echo "🏗️  Building the project..."
pnpm build
if [[ $? -eq 0 ]]; then
    echo "✅ Project built successfully!"
else
    echo "❌ Project build failed!"
    exit 1
fi
echo

echo "👏 Build completed successfully!"
echo

# Final success message
echo "$bars"
echo "♥️ Landing Successful, we are green!"
echo "$bars"
echo
