use anchor_lang::prelude::*;
use crate::{
    error::ErrorCode,
    state::{SmartBrainState, SMARTBRAIN_SEED},
};

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct Update<'info> {
    /// Mutable SmartBrain state — must be owned by the signer.
    #[account(
        mut,
        seeds = [SMARTBRAIN_SEED, authority.key().as_ref()],
        bump = smart_brain.bump,
        has_one = authority @ ErrorCode::Unauthorized
    )]
    pub smart_brain: Account<'info, SmartBrainState>,

    /// Only the registered authority may update state.
    pub authority: Signer<'info>,
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

pub fn handler(ctx: Context<Update>, paused: bool) -> Result<()> {
    let state = &mut ctx.accounts.smart_brain;

    state.paused = paused;
    state.last_updated_at = Clock::get()?.unix_timestamp;

    Ok(())
}
