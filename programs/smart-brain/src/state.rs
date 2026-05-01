use anchor_lang::prelude::*;

/// Maximum byte length of an execution payload stored on-chain.
/// Capped at 255 so that `payload_len: u8` can losslessly represent the full range.
pub const MAX_PAYLOAD_LEN: usize = 255;

/// Maximum number of executions tracked in the execution log.
pub const MAX_EXECUTION_LOG: usize = 32;

/// Seeds used for PDA derivation of the SmartBrain state account.
pub const SMARTBRAIN_SEED: &[u8] = b"smartbrain";

/// Seeds used for PDA derivation of the execution-record log account.
pub const EXECUTION_RECORD_SEED: &[u8] = b"exec_log";

// ---------------------------------------------------------------------------
// SmartBrainState
// ---------------------------------------------------------------------------

/// Primary state account for the SmartBrain program.
///
/// Serialized on-chain size: discriminator(8) + LEN(397) = 405 bytes
/// (well under the 1 024-byte ZeroCopy threshold).
#[account]
#[derive(Default)]
pub struct SmartBrainState {
    /// Controlling authority (wallet that can update / pause the program).
    pub authority: Pubkey, // 32
    /// Canonical bump seed stored at init time.
    pub bump: u8, // 1
    /// Whether the program is paused (no execute calls allowed).
    pub paused: bool, // 1
    /// Monotonically-increasing execution counter.
    pub execution_count: u64, // 8
    /// Unix timestamp of the last successful execution.
    pub last_executed_at: i64, // 8
    /// Unix timestamp of the last state update.
    pub last_updated_at: i64, // 8
    /// Versioning field for future account migrations.
    pub version: u8, // 1
    /// Reserved padding — keeps the struct at a round size for future fields.
    pub _reserved: [u8; 338], // 338  →  total payload = 397
}

impl SmartBrainState {
    /// Borsh-serialized layout (no alignment padding):
    ///   authority(32) + bump(1) + paused(1) + execution_count(8)
    ///   + last_executed_at(8) + last_updated_at(8) + version(1) + _reserved(338)
    ///   = 397 bytes.  SPACE = discriminator(8) + 397 = 405.
    pub const LEN: usize = 32 + 1 + 1 + 8 + 8 + 8 + 1 + 338;
    pub const SPACE: usize = 8 + Self::LEN;
}

// ---------------------------------------------------------------------------
// ExecutionRecord  (ZeroCopy — exceeds 1 024 bytes)
// ---------------------------------------------------------------------------

/// A compact, zero-copy log of recent on-chain executions.
///
/// Size: 8 (discriminator) + std::mem::size_of::<ExecutionRecord>()
///       = 8 + 10 280 bytes  →  ZeroCopy is required.
#[account(zero_copy)]
#[repr(C)]
pub struct ExecutionRecord {
    /// Authority that owns this log.
    pub authority: Pubkey, // 32
    /// Bump for the PDA of this account.
    pub bump: u8, // 1
    /// Number of entries written so far (wraps at MAX_EXECUTION_LOG).
    pub count: u32, // 4
    /// Padding to 8-byte alignment.
    pub _pad: [u8; 3], // 3
    /// Circular log of execution entries.
    pub entries: [ExecutionEntry; MAX_EXECUTION_LOG], // 32 × 320 = 10 240
}

impl ExecutionRecord {
    /// SPACE uses `std::mem::size_of` to correctly account for any
    /// `#[repr(C)]`-mandated alignment padding between fields.
    pub const SPACE: usize = 8 + std::mem::size_of::<ExecutionRecord>();
}

/// A single entry in the execution log.
#[zero_copy]
#[repr(C)]
pub struct ExecutionEntry {
    /// Who triggered this execution.
    pub caller: Pubkey, // 32
    /// Wall-clock time of the execution.
    pub timestamp: i64, // 8
    /// Execution counter at the time of the call.
    pub sequence: u64, // 8
    /// Inline payload snapshot (first MAX_PAYLOAD_LEN bytes of the call data).
    pub payload: [u8; MAX_PAYLOAD_LEN], // 255
    /// Actual payload length recorded (≤ MAX_PAYLOAD_LEN).
    pub payload_len: u8, // 1
    /// Reserved for future fields.
    pub _reserved: [u8; 16], // 16  →  entry total = 320
}

impl ExecutionEntry {
    /// Borsh-serialized size: 32 + 8 + 8 + 255 + 1 + 16 = 320 bytes.
    pub const LEN: usize = 32 + 8 + 8 + MAX_PAYLOAD_LEN + 1 + 16;
}
