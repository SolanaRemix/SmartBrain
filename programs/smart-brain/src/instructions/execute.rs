use anchor_lang::prelude::*;
use crate::{
    error::ErrorCode,
    state::{
        ExecutionRecord, SmartBrainState, EXECUTION_RECORD_SEED, MAX_EXECUTION_LOG, MAX_PAYLOAD_LEN,
        SMARTBRAIN_SEED,
    },
};

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct Execute<'info> {
    /// The SmartBrain state — must belong to the authority.
    #[account(
        mut,
        seeds = [SMARTBRAIN_SEED, authority.key().as_ref()],
        bump = smart_brain.bump,
        has_one = authority @ ErrorCode::Unauthorized,
        constraint = !smart_brain.paused @ ErrorCode::ProgramPaused
    )]
    pub smart_brain: Account<'info, SmartBrainState>,

    /// Zero-copy execution log — initialized in `initialize`, scoped to the authority.
    #[account(
        mut,
        seeds = [EXECUTION_RECORD_SEED, authority.key().as_ref()],
        bump = execution_record.load()?.bump,
        constraint = execution_record.load()?.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub execution_record: AccountLoader<'info, ExecutionRecord>,

    /// Caller — must be the registered authority.
    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

pub fn handler(ctx: Context<Execute>, payload: Vec<u8>) -> Result<()> {
    require!(
        payload.len() <= MAX_PAYLOAD_LEN,
        ErrorCode::PayloadTooLarge
    );

    let clock = Clock::get()?;

    // ---- update state -------------------------------------------------------
    let new_count: u64 = {
        let state = &mut ctx.accounts.smart_brain;

        let next = state
            .execution_count
            .checked_add(1)
            .ok_or(error!(ErrorCode::ArithmeticOverflow))?;

        state.execution_count = next;
        state.last_executed_at = clock.unix_timestamp;
        next
    };

    // ---- append to zero-copy log --------------------------------------------
    {
        let mut record = ctx.accounts.execution_record.load_mut()?;

        let idx = (record.count as usize) % MAX_EXECUTION_LOG;

        let entry = &mut record.entries[idx];

        entry.caller = ctx.accounts.authority.key();
        entry.timestamp = clock.unix_timestamp;
        entry.sequence = new_count;

        let copy_len = payload.len().min(MAX_PAYLOAD_LEN);
        entry.payload[..copy_len].copy_from_slice(&payload[..copy_len]);
        // Zero-out any leftover bytes from a previous entry.
        if copy_len < MAX_PAYLOAD_LEN {
            entry.payload[copy_len..].fill(0);
        }
        entry.payload_len = copy_len as u8;
        entry._reserved = [0u8; 16];

        record.count = record
            .count
            .checked_add(1)
            .ok_or(error!(ErrorCode::ArithmeticOverflow))?;
    }

    Ok(())
}
