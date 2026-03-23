# Auction Pulse Smart Contract - Makefile
# Usage: make [target]

.PHONY: help check build test clean deploy verify docs

# Default target
help:
	@echo "Auction Pulse Smart Contract - Available Targets"
	@echo ""
	@echo "  make check          Check prerequisites (Rust, Cargo, Stellar CLI)"
	@echo "  make build          Build WASM contract"
	@echo "  make test           Run unit tests"
	@echo "  make clean          Clean build artifacts"
	@echo "  make deploy         Deploy to Testnet (requires account)"
	@echo "  make verify         Verify contract on Testnet"
	@echo "  make docs           Generate documentation"
	@echo "  make all            Check → Build → Test (full setup)"
	@echo ""
	@echo "Environment Variables:"
	@echo "  CONTRACT_SOURCE     Stellar account key (default: auction-key)"
	@echo "  CONTRACT_NETWORK    Network to deploy to (default: testnet)"
	@echo "  CONTRACT_ID         Contract ID for verification"
	@echo ""
	@echo "Examples:"
	@echo "  make build"
	@echo "  make deploy CONTRACT_SOURCE=my-key CONTRACT_NETWORK=testnet"
	@echo "  make verify CONTRACT_ID=C..."

# === CHECKS ===
check:
	@echo "[*] Checking system prerequisites..."
	@command -v rustc > /dev/null 2>&1 || (echo "[!] rustc not found - install from https://rustup.rs"; exit 1)
	@echo "[+] Rust installed: $$(rustc --version)"
	@command -v cargo > /dev/null 2>&1 || (echo "[!] cargo not found"; exit 1)
	@echo "[+] Cargo installed: $$(cargo --version)"
	@command -v stellar > /dev/null 2>&1 || (echo "[!] Stellar CLI not found - install from https://github.com/stellar/stellar-cli/releases"; exit 1)
	@echo "[+] Stellar CLI installed"
	@rustup target list | grep wasm32-unknown-unknown | grep installed > /dev/null || (echo "[*] Installing wasm32-unknown-unknown target..."; rustup target add wasm32-unknown-unknown)
	@echo "[+] Prerequisites OK!"

# === BUILD ===
build: check
	@echo "[*] Building Soroban contract..."
	cargo build --target wasm32-unknown-unknown --release
	@ls -lh target/wasm32-unknown-unknown/release/auction_contract.wasm 2>/dev/null && echo "[+] Build successful!" || (echo "[!] Build failed"; exit 1)

# === TESTS ===
test: check
	@echo "[*] Running unit tests..."
	cargo test --lib
	@echo "[+] Tests passed!"

# === CLEAN ===
clean:
	@echo "[*] Cleaning build artifacts..."
	cargo clean
	rm -rf target/
	@echo "[+] Clean complete!"

# === DEPLOY ===
CONTRACT_SOURCE ?= auction-key
CONTRACT_NETWORK ?= testnet

deploy: build
	@echo "[*] Deploying to $(CONTRACT_NETWORK) with account $(CONTRACT_SOURCE)..."
	stellar contract deploy \
		--wasm target/wasm32-unknown-unknown/release/auction_contract.wasm \
		--source $(CONTRACT_SOURCE) \
		--network $(CONTRACT_NETWORK)
	@echo "[+] Deployment complete! Save your contract ID above."

# === VERIFY ===
CONTRACT_ID ?= 

verify:
	@if [ -z "$(CONTRACT_ID)" ]; then \
		echo "[!] CONTRACT_ID required: make verify CONTRACT_ID=C..."; \
		exit 1; \
	fi
	@echo "[*] Verifying contract $(CONTRACT_ID)..."
	stellar contract info --id $(CONTRACT_ID) --network $(CONTRACT_NETWORK)

# === DOCS ===
docs:
	@echo "[*] Generating documentation..."
	cargo doc --no-deps --target-dir target/docs
	@echo "[+] Docs generated in target/docs/"

# === COMBINED ===
all: check build test
	@echo ""
	@echo "[+] ✅ Setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Create Stellar account: stellar keys generate --network testnet --name auction-key"
	@echo "  2. Fund account: https://friendbot.stellar.org/?addr=G..."
	@echo "  3. Deploy: make deploy"
	@echo ""

# Watch for changes and rebuild
watch:
	@echo "[*] Watching for changes (requires watchexec)..."
	watchexec -e rs make build

# Run a quick contract test
invoke:
	@if [ -z "$(CONTRACT_ID)" ]; then \
		echo "[!] CONTRACT_ID required: make invoke CONTRACT_ID=C..."; \
		exit 1; \
	fi
	@echo "[*] Invoking get_top_bid on $(CONTRACT_ID)..."
	stellar contract invoke \
		--id $(CONTRACT_ID) \
		--source $(CONTRACT_SOURCE) \
		--network $(CONTRACT_NETWORK) \
		-- get_top_bid
