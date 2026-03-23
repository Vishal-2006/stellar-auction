#![no_std]

use soroban_sdk::{contract, contractimpl, log, symbol_short, vec, Env, Symbol, String, Vec};

#[contract]
pub struct AuctionContract;

// Storage keys for persistent data
const TOP_BIDDER_KEY: &str = "top_bidder";
const TOP_BID_AMOUNT_KEY: &str = "top_bid_amount";
#[allow(dead_code)]
const BID_HISTORY_KEY: &str = "bid_history";

#[contractimpl]
impl AuctionContract {
    /// Get the current top bid and bidder
    /// Returns: (bidder: String, amount: i128)
    pub fn get_top_bid(env: Env) -> (String, i128) {
        let storage = env.storage().instance();
        
        let bidder = storage.get::<_, String>(
            &Symbol::new(&env, TOP_BIDDER_KEY)
        ).unwrap_or_else(|| String::from_str(&env, ""));
        
        let amount = storage.get::<_, i128>(
            &Symbol::new(&env, TOP_BID_AMOUNT_KEY)
        ).unwrap_or(0);
        
        (bidder, amount)
    }

    /// Place a new bid on the auction
    /// 
    /// # Arguments
    /// * `bidder` - The address/ID of the bidder
    /// * `amount` - The bid amount in stroops (1 XLM = 10^7 stroops)
    ///
    /// # Returns
    /// * `bool` - true if bid was placed successfully
    pub fn place_bid(env: Env, bidder: String, amount: i128) -> bool {
        // Validate inputs
        if amount <= 0 {
            log!(&env, "Bid amount must be positive");
            return false;
        }

        if bidder.len() == 0 {
            log!(&env, "Bidder address cannot be empty");
            return false;
        }

        let storage = env.storage().instance();

        // Get current top bid
        let (_current_bidder, current_amount) = Self::get_top_bid(env.clone());

        // Validate new bid is higher than current bid
        if amount <= current_amount {
            log!(&env, "Bid must be higher than current top bid");
            return false;
        }

        // Update storage with new top bid
        storage.set::<_, String>(
            &Symbol::new(&env, TOP_BIDDER_KEY),
            &bidder
        );
        
        storage.set::<_, i128>(
            &Symbol::new(&env, TOP_BID_AMOUNT_KEY),
            &amount
        );

        // Emit "new_bid" event with bidder and amount
        env.events().publish(
            (symbol_short!("new_bid"),),
            (bidder.clone(), amount),
        );

        // Log the bid placement
        log!(&env, "New bid placed: {} stroops by {}", amount, bidder);

        true
    }

    /// Get bid history (placeholder for future implementation)
    /// Returns: Vector of bids
    pub fn get_bid_history(env: Env) -> Vec<(String, i128)> {
        let _storage = env.storage().instance();
        
        // For now, return the top bidder as a single entry
        let (bidder, amount) = Self::get_top_bid(env.clone());
        
        if bidder.len() > 0 {
            vec![&env, (bidder, amount)]
        } else {
            vec![&env]
        }
    }

    /// Check if a given address is currently winning
    pub fn is_top_bidder(env: Env, address: String) -> bool {
        let (current_bidder, _) = Self::get_top_bid(env);
        current_bidder == address
    }

    /// Get contract version
    pub fn version(env: Env) -> String {
        String::from_str(&env, "0.1.0")
    }

    /// Reset auction (admin only - for testing)
    /// WARNING: This is dangerous in production - add proper authorization
    pub fn reset(env: Env) {
        let storage = env.storage().instance();
        storage.remove(&Symbol::new(&env, TOP_BIDDER_KEY));
        storage.remove(&Symbol::new(&env, TOP_BID_AMOUNT_KEY));
        
        log!(&env, "Auction reset");
    }
}

mod test;
