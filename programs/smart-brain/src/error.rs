use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("Arithmetic underflow")]
    ArithmeticUnderflow,
    #[msg("Unauthorized: signer is not the authority")]
    Unauthorized,
    #[msg("Invalid PDA derivation")]
    InvalidPda,
    #[msg("SmartBrain account is already initialized")]
    AlreadyInitialized,
    #[msg("Invalid state transition")]
    InvalidStateTransition,
    #[msg("Execution count limit reached")]
    ExecutionLimitReached,
    #[msg("Payload exceeds maximum allowed size")]
    PayloadTooLarge,
    #[msg("Program is paused")]
    ProgramPaused,
    #[msg("Bump seed mismatch")]
    BumpMismatch,
}
