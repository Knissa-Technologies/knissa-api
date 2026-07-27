# ADR-002: Database Architecture

- **Status:** Accepted
- **Date:** July 2026
- **Decision Makers:** Knissa Engineering Team

---

# Context

Knissa is a financial infrastructure platform responsible for storing users, wallets, transactions, exchange rates, payments, merchant accounts and immutable ledger records.

The database is the foundation of the platform and must guarantee strong consistency, durability and financial integrity.

Financial applications cannot tolerate inconsistent or partially committed data.

The database architecture must provide:

- ACID transactions
- Referential integrity
- High reliability
- Predictable performance
- Auditability
- Long-term scalability

---

# Decision

Knissa adopts **PostgreSQL** as its primary relational database.

Database access is implemented exclusively through **Prisma ORM**.

---

# Alternatives Considered

## MySQL

Pros

- Mature ecosystem
- Good performance
- Large community

Cons

- Less advanced SQL capabilities
- Fewer native analytical features

Decision

Rejected.

---

## MongoDB

Pros

- Flexible schema
- Easy horizontal scaling

Cons

- Weak fit for financial transactions
- Complex transactional consistency
- Less suitable for relational financial data

Decision

Rejected.

---

## PostgreSQL

Pros

- Full ACID compliance
- Strong consistency
- Excellent indexing
- Rich SQL features
- JSON support
- Native UUID
- Advanced transactions
- Proven reliability

Decision

Accepted.

---

# Why PostgreSQL?

PostgreSQL provides:

- ACID compliance
- Strong consistency
- Foreign Keys
- Rich indexing
- Materialized Views
- JSON support
- Window Functions
- Row-level locking
- Mature ecosystem

These characteristics make PostgreSQL ideal for financial applications.

---

# Why Prisma?

Prisma provides:

- Type-safe queries
- Excellent TypeScript integration
- Migration system
- Automatic client generation
- Reduced boilerplate
- High developer productivity

---

# Primary Keys

Every entity uses UUID as its primary identifier.

Examples:

- User
- Wallet
- Transaction
- LedgerEntry
- Exchange
- Payment
- Merchant

Reasons:

- Better security
- No sequential identifiers
- Easier distributed systems
- Simpler future microservices

---

# Database Principles

Every database decision must follow:

- Referential Integrity
- Data Normalization
- Explicit Relationships
- Foreign Keys
- Immutable Financial Records
- Auditability
- Predictable Migrations

---

# Financial Records

Financial data is immutable.

The following entities must never be updated in ways that change financial history:

- LedgerEntry
- Transaction
- Exchange
- Payment

Corrections must always generate compensating records.

Balances are calculated exclusively from Ledger entries.

The Ledger is the single source of truth.

---

# Multi-Currency Support

Currencies are stored in database tables.

Every Wallet belongs to exactly one Currency.

Exchange Rates are versioned.

New currencies must be introduced without changing application code.

---

# Soft Delete Strategy

Business entities may support soft delete.

Examples:

- Users
- Merchant
- Notifications

Financial entities must never be deleted.

Examples:

- LedgerEntry
- Transaction
- Exchange
- Payment
- AuditLog

---

# Naming Conventions

Tables:

- snake_case
- plural names

Examples:

```text
users
wallets
transactions
ledger_entries
exchange_rates
```

Columns:

```text
created_at
updated_at
deleted_at
wallet_id
currency_id
```

---

# Indexing Strategy

Indexes should exist for:

- Foreign Keys
- Frequently queried columns
- Unique identifiers
- Search fields

Examples:

```text
email

wallet_id

currency_id

transaction_id

created_at
```

---

# Transactions

Financial operations must always execute inside database transactions.

Examples:

- Transfer
- Deposit
- Withdrawal
- Exchange
- Payment

No financial operation may leave the database in a partially committed state.

---

# Audit Strategy

Every financial operation must be traceable.

The database must preserve:

- Creation date
- Update date
- Responsible user
- Related transaction
- Audit references

---

# Future Evolution

Possible future improvements include:

- Read Replicas
- Partitioning
- Connection Pooling
- Event Streaming
- Backup Replication
- Multi-region deployment

---

# Consequences

## Positive

- Strong consistency
- High reliability
- Excellent maintainability
- Easier scaling
- Mature tooling
- Excellent TypeScript support

## Negative

- Relational modeling requires discipline
- UUID indexes are larger than integer indexes
- Schema migrations require planning

---

# Decision Summary

| Item | Decision |
|------|----------|
| Database | PostgreSQL |
| ORM | Prisma |
| Primary Keys | UUID |
| Transactions | ACID |
| Financial Model | Immutable Ledger |
| Currency Model | Database Tables |
| Naming | snake_case |
| Soft Delete | Business entities only |

---

# References

- BLUEPRINT.md
- ADR-001 Architecture Style
- ADR-003 Financial Core