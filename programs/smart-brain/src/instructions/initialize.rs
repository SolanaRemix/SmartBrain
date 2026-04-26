use anchor_lang::prelude::*;
use crate::state::{SmartBrainState, SMARTBRAIN_SEED};

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// The state account to be initialized.  Seeds are restricted to the
    /// canonical prefix + authority pubkey so that each authority can own
    /// exactly one SmartBrain state.
    #[account(
        init,
        payer = authority,
        space = SmartBrainState::SPACE,
        seeds = [SMARTBRAIN_SEED, authority.key().as_ref()],
        bump
    )]
    pub smart_brain: Account<'info, SmartBrainState>,

    /// The wallet that will own and control this state account.
    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    let state = &mut ctx.accounts.smart_brain;

    state.authority = ctx.accounts.authority.key();
    state.bump = ctx.bumps.smart_brain;
    state.paused = false;
    state.execution_count = 0;
    state.last_executed_at = 0;
    state.last_updated_at = Clock::get()?.unix_timestamp;
    state.version = 1;
    state._reserved = [0u8; 338];

    Ok(())
}
