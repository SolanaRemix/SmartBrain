use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;

use instructions::{execute::Execute, initialize::Initialize, update::Update};

declare_id!("SmBr1111111111111111111111111111111111111111");

#[program]
pub mod smart_brain {
    use super::*;

    /// Creates and initialises the SmartBrain state PDA for `authority`.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::handler(ctx)
    }

    /// Records an execution against the SmartBrain state.
    ///
    /// `payload` is an arbitrary byte vector (≤ 255 bytes) that the caller
    /// wants to log on-chain.
    pub fn execute(ctx: Context<Execute>, payload: Vec<u8>) -> Result<()> {
        instructions::execute::handler(ctx, payload)
    }

    /// Updates the mutable fields of the SmartBrain state (pause toggle).
    pub fn update(ctx: Context<Update>, paused: bool) -> Result<()> {
        instructions::update::handler(ctx, paused)
    }
}
