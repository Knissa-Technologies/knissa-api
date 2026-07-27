# ADR-003: Financial Core

- **Status:** Accepted
- **Date:** July 2026
- **Decision Makers:** Knissa Engineering Team

---

# Context

Knissa is a financial infrastructure platform responsible for managing digital wallets, payments, currency exchange, merchant accounts and future banking integrations.

Financial systems require strict guarantees of consistency, traceability, auditability and transactional integrity.

Incorrect balance calculations or inconsistent financial records may result in financial losses, regulatory issues and loss of customer trust.

For this reason, Knissa adopts an immutable ledger architecture as the foundation of every financial operation.

---

# Decision

Knissa adopts an **Immutable Ledger Model**.

Every financial operation generates one or more ledger entries.

The ledger is the single source of truth.

Wallet balances are always derived from ledger records.

Balances are never considered authoritative financial data.

---

# Financial Principles

Every financial operation must follow these principles:

- Immutability
- Auditability
- Consistency
- Traceability
- Atomicity
- Idempotency
- Deterministic calculations

Financial history must never be rewritten.

---

# Ledger Principles

Ledger entries are:

- Immutable
- Timestamped
- Traceable
- Transactional
- Financially consistent

Ledger entries are never:

- Updated
- Deleted
- Reordered

Corrections always generate compensating entries.

---

# Financial Lifecycle

Every financial operation follows the same lifecycle.

```text
Request

↓

Validation

↓

Business Rules

↓

Database Transaction

↓

Ledger Entries

↓

Balance Calculation

↓

Transaction Completed

↓

Notification

↓

Audit
```

No operation may skip this process.

---

# Wallet

Each wallet belongs to:

- One User
- One Currency

A user may own multiple wallets.

Example:

```text
User

↓

Wallet (USD)

Wallet (EUR)

Wallet (BRL)

Wallet (HTG)

Wallet (CAD)
```

Wallets store metadata only.

The financial balance is calculated from ledger entries.

---

# Transactions

Transactions represent business operations.

Examples:

- Deposit
- Withdrawal
- Internal Transfer
- External Transfer
- Exchange
- Payment
- Refund
- Fee
- Adjustment

Every transaction creates one or more ledger entries.

Transactions never modify balances directly.

---

# Ledger Entries

Ledger entries represent financial movements.

Typical fields include:

- id
- walletId
- transactionId
- currencyId
- amount
- entryType
- reference
- createdAt

Ledger entries are immutable.

---

# Balance Calculation

Wallet balances are derived from ledger entries.

Conceptually:

```text
Balance

=

Credits

-

Debits
```

Balances may be cached for performance but the ledger always remains the authoritative source.

---

# Exchange

Currency exchange consists of:

- Source Wallet
- Destination Wallet
- Exchange Rate
- Exchange Fee
- Ledger Entries

Every exchange creates:

- Transaction
- Ledger Entries
- Exchange Record

---

# Payments

Payments follow the same financial model.

Examples:

- QR Payments
- Merchant Payments
- Payment Links
- Future PIX
- Future Banking APIs

Every payment generates ledger entries.

---

# Fees

Fees are explicit financial operations.

Examples:

- Transfer Fee
- Exchange Fee
- Merchant Fee
- Withdrawal Fee

Fees always generate independent ledger entries.

Fees must never be hidden inside another financial record.

---

# Double-Entry Accounting

The platform is designed to support full double-entry accounting.

Future versions may introduce:

- Debit Accounts
- Credit Accounts
- General Ledger
- Accounting Reports

without changing the financial architecture.

---

# Idempotency

Financial operations must support idempotent execution.

Repeated requests using the same idempotency key must never execute the same financial operation twice.

This prevents duplicate transfers and duplicate payments.

---

# Auditability

Every financial operation must be completely traceable.

The platform records:

- Timestamp
- User
- Wallet
- Currency
- Transaction
- Operation Type
- Related Ledger Entries

Future versions may include complete audit logs and event history.

---

# ACID Transactions

Every financial operation executes inside a database transaction.

Possible outcomes:

```text
Everything succeeds

OR

Everything rolls back
```

Partial financial updates are never allowed.

---

# Future Evolution

The financial architecture supports:

- Merchant Accounts
- Virtual Cards
- Physical Cards
- Banking Integrations
- Open Finance
- International Transfers
- SWIFT
- PIX
- ACH
- SEPA
- Interac

without fundamental architectural changes.

---

# Consequences

## Positive

- Strong financial integrity
- Complete auditability
- Excellent scalability
- Predictable balance calculation
- Easier regulatory compliance
- Future-ready architecture

## Negative

- More complex implementation
- More database writes
- Ledger growth over time
- Requires careful transaction management

---

# Decision Summary

| Item | Decision |
|------|----------|
| Financial Model | Immutable Ledger |
| Balance Source | Ledger Entries |
| Balance Storage | Cached only (optional) |
| Transactions | ACID Required |
| Ledger | Immutable |
| Corrections | Compensating Entries |
| Future Accounting | Double-entry Ready |

---

# References

- BLUEPRINT.md
- ADR-001 Architecture Style
- ADR-002 Database Architecture