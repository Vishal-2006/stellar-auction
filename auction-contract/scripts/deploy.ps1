#!/usr/bin/env pwsh
# Auction Pulse Smart Contract Helper Script
# Run from: cd auction-contract && .\scripts\deploy.ps1

param(
    [ValidateSet('build', 'test', 'deploy', 'verify', 'invoke')]
    [string]$action = 'build',
    
    [string]$sourceKey = 'auction-key',
    [string]$network = 'testnet'
)

# Colors for output
$colors = @{
    Success = 'Green'
    Error = 'Red'
    Info = 'Cyan'
    Warning = 'Yellow'
}

function Write-Status {
    param([string]$message, [string]$type = 'Info')
    Write-Host $message -ForegroundColor $colors[$type]
}

# === BUILD ===
function Build-Contract {
    Write-Status "🔨 Building Soroban contract..." "Info"
    
    cargo build --target wasm32-unknown-unknown --release
    
    if ($LASTEXITCODE -eq 0) {
        Write-Status "✅ Build successful!" "Success"
        Get-Item "target\wasm32-unknown-unknown\release\auction_contract.wasm" | ForEach-Object {
            Write-Status "   WASM: $($_.FullName) ($('{0:N0}' -f $_.Length) bytes)" "Info"
        }
    } else {
        Write-Status "❌ Build failed!" "Error"
        exit 1
    }
}

# === TEST ===
function Test-Contract {
    Write-Status "🧪 Running unit tests..." "Info"
    
    cargo test --lib
    
    if ($LASTEXITCODE -eq 0) {
        Write-Status "✅ All tests passed!" "Success"
    } else {
        Write-Status "❌ Tests failed!" "Error"
        exit 1
    }
}

# === DEPLOY ===
function Deploy-Contract {
    param([string]$key, [string]$net)
    
    Write-Status "🚀 Deploying to $net..." "Info"
    
    if (-not (Test-Path "target\wasm32-unknown-unknown\release\auction_contract.wasm")) {
        Write-Status "❌ WASM file not found! Run 'build' first." "Error"
        exit 1
    }
    
    stellar contract deploy `
        --wasm target/wasm32-unknown-unknown/release/auction_contract.wasm `
        --source $key `
        --network $net
    
    Write-Status "✅ Deployment complete! Save your contract ID." "Success"
}

# === VERIFY ===
function Verify-Deployment {
    param([string]$contractId, [string]$net)
    
    if (-not $contractId) {
        Write-Status "❌ Contract ID required: -contractId <id>" "Error"
        exit 1
    }
    
    Write-Status "✓ Getting contract info for $contractId..." "Info"
    stellar contract info --id $contractId --network $net
}

# === INVOKE ===
function Invoke-Method {
    param([string]$contractId, [string]$method, [string]$key, [string]$net)
    
    if (-not $contractId) {
        Write-Status "❌ Contract ID required!" "Error"
        exit 1
    }
    
    Write-Status "→ Invoking $method..." "Info"
    stellar contract invoke `
        --id $contractId `
        --source $key `
        --network $net `
        -- @args
}

# === MAIN ===
Write-Status "
╔════════════════════════════════════════╗
║  Auction Pulse - Contract Helper Script  ║
║         Stellar Smart Contract           ║
╚════════════════════════════════════════╝
" "Info"

switch ($action) {
    'build'  { Build-Contract }
    'test'   { Test-Contract }
    'deploy' { Deploy-Contract -key $sourceKey -net $network }
    'verify' { Write-Status "Use: .\deploy.ps1 verify -contractId <id>" "Warning" }
    'invoke' { Write-Status "Use: stellar contract invoke --id <id> --source <key> --network <net> -- <method>" "Warning" }
    default  { Write-Status "Unknown action: $action" "Error"; exit 1 }
}

Write-Status "✅ Done!" "Success"
