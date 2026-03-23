#!/bin/bash
# Auction Pulse Smart Contract Setup Helper
# Usage: chmod +x setup.sh && ./setup.sh

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# === SYSTEM CHECK ===
check_system() {
    log_info "Checking system prerequisites..."
    
    # Check Rust
    if ! command -v rustc &> /dev/null; then
        log_error "Rust not found. Install from https://rustup.rs/"
        exit 1
    fi
    log_success "Rust $(rustc --version)"
    
    # Check Cargo
    if ! command -v cargo &> /dev/null; then
        log_error "Cargo not found!"
        exit 1
    fi
    log_success "Cargo $(cargo --version)"
    
    # Check Stellar CLI
    if ! command -v stellar &> /dev/null; then
        log_warning "Stellar CLI not found. Install: https://github.com/stellar/stellar-cli/releases"
        log_info "Or with Homebrew: brew install stellar-cli"
    else
        log_success "Stellar CLI installed"
    fi
    
    # Install WASM target
    log_info "Installing wasm32-unknown-unknown target..."
    rustup target add wasm32-unknown-unknown
    log_success "WASM target ready"
}

# === BUILD ===
build_contract() {
    log_info "Building Soroban contract..."
    cargo build --target wasm32-unknown-unknown --release
    
    if [ -f target/wasm32-unknown-unknown/release/auction_contract.wasm ]; then
        size=$(du -h target/wasm32-unknown-unknown/release/auction_contract.wasm | cut -f1)
        log_success "Build successful! WASM size: $size"
    else
        log_error "Build failed - WASM file not generated"
        exit 1
    fi
}

# === TEST ===
test_contract() {
    log_info "Running unit tests..."
    cargo test --lib
    log_success "All tests passed!"
}

# === DEPLOY ===
deploy_contract() {
    local source_key="${1:-auction-key}"
    local network="${2:-testnet}"
    
    if [ ! -f target/wasm32-unknown-unknown/release/auction_contract.wasm ]; then
        log_error "WASM file not found! Run build first."
        exit 1
    fi
    
    log_info "Deploying to $network..."
    stellar contract deploy \
        --wasm target/wasm32-unknown-unknown/release/auction_contract.wasm \
        --source "$source_key" \
        --network "$network"
    
    log_success "Deployment complete! Save your contract ID."
}

# === FULL SETUP ===
full_setup() {
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║  Auction Pulse Smart Contract Setup     ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    
    check_system
    echo ""
    build_contract
    echo ""
    test_contract
    echo ""
    log_info "Setup complete! Next steps:"
    log_info "1. Create Stellar account: stellar keys generate --network testnet"
    log_info "2. Fund with testnet XLM: visit https://friendbot.stellar.org/"
    log_info "3. Deploy: $0 deploy <account-key> testnet"
    echo ""
}

# === MAIN ===
case "${1:-setup}" in
    setup)   full_setup ;;
    check)   check_system ;;
    build)   build_contract ;;
    test)    test_contract ;;
    deploy)  deploy_contract "${2:-auction-key}" "${3:-testnet}" ;;
    *)
        echo "Usage: $0 [setup|check|build|test|deploy]"
        echo ""
        echo "Commands:"
        echo "  setup          Full setup & build"
        echo "  check          Check prerequisites"
        echo "  build          Build WASM contract"
        echo "  test           Run unit tests"
        echo "  deploy [key] [network]  Deploy to Testnet"
        exit 1
        ;;
esac
