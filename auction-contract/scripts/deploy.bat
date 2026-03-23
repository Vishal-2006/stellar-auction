@echo off
REM Auction Pulse Smart Contract Helper - Windows Batch Version
REM Run from: cd auction-contract && scripts\deploy.bat

setlocal enabledelayedexpansion

if "%1"=="" (
    set ACTION=build
) else (
    set ACTION=%1
)

echo.
echo ========================================
echo Auction Pulse - Contract Helper (Windows)
echo ========================================
echo.

if /i "%ACTION%"=="build" (
    echo [*] Building Soroban contract...
    cargo build --target wasm32-unknown-unknown --release
    if %ERRORLEVEL% EQU 0 (
        echo [+] Build successful!
        for %%F in (target\wasm32-unknown-unknown\release\auction_contract.wasm) do (
            echo [+] WASM: %%~fF ^(%%~zF bytes^)
        )
    ) else (
        echo [-] Build failed!
        exit /b 1
    )
    goto :done
)

if /i "%ACTION%"=="test" (
    echo [*] Running unit tests...
    cargo test --lib
    if %ERRORLEVEL% EQU 0 (
        echo [+] All tests passed!
    ) else (
        echo [-] Tests failed!
        exit /b 1
    )
    goto :done
)

if /i "%ACTION%"=="deploy" (
    set SOURCE_KEY=%2
    set NETWORK=%3
    
    if "!SOURCE_KEY!"=="" set SOURCE_KEY=auction-key
    if "!NETWORK!"=="" set NETWORK=testnet
    
    echo [*] Deploying to !NETWORK!...
    
    if not exist target\wasm32-unknown-unknown\release\auction_contract.wasm (
        echo [-] WASM file not found! Run build first.
        exit /b 1
    )
    
    stellar contract deploy ^
        --wasm target/wasm32-unknown-unknown/release/auction_contract.wasm ^
        --source !SOURCE_KEY! ^
        --network !NETWORK!
    
    if %ERRORLEVEL% EQU 0 (
        echo [+] Deployment complete! Save your contract ID.
    ) else (
        echo [-] Deployment failed!
        exit /b 1
    )
    goto :done
)

if /i "%ACTION%"=="check" (
    echo [*] Checking prerequisites...
    
    where rustc >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [+] Rust: Found
        rustc --version
    ) else (
        echo [-] Rust: NOT FOUND - Install from https://rustup.rs/
        exit /b 1
    )
    
    where cargo >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [+] Cargo: Found
        cargo --version
    ) else (
        echo [-] Cargo: NOT FOUND
        exit /b 1
    )
    
    where stellar >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [+] Stellar CLI: Found
    ) else (
        echo [!] Stellar CLI: NOT FOUND - Download from https://github.com/stellar/stellar-cli/releases
    )
    
    echo [*] Trying to add wasm32-unknown-unknown target...
    rustup target add wasm32-unknown-unknown
    echo [+] Prerequisites checked!
    goto :done
)

echo.
echo Usage: scripts\deploy.bat [ACTION] [OPTIONS]
echo.
echo Actions:
echo   build               Build WASM contract
echo   test                Run unit tests
echo   check               Check prerequisites
echo   deploy [key] [net]  Deploy contract (default: auction-key testnet)
echo.
exit /b 1

:done
echo.
echo [+] Done!
echo.
