# ADR-001: Architecture Style

- **Status:** Accepted
- **Date:** July 2026
- **Decision Makers:** Knissa Engineering Team

---

# Context

Knissa is a financial infrastructure platform designed to support multiple financial products, including digital accounts, multi-currency wallets, international transfers, currency exchange, payment services, merchant accounts and future banking integrations.

The platform is expected to evolve continuously while maintaining high standards of security, scalability and maintainability.

During the initial stages, the engineering team is intentionally small. The chosen architecture must maximize development speed while preserving code quality and enabling future growth.

The architecture must:

- be easy to understand;
- support modular development;
- isolate business domains;
- simplify automated testing;
- reduce operational complexity;
- minimize infrastructure costs;
- support future evolution into distributed services if necessary.

---

# Decision

Knissa adopts a **Modular Monolith Architecture**.

The application is organized into independent business modules, each responsible for its own domain logic, services, repositories and API endpoints.

Example modules:

```text
Authentication

Users

Countries

Currencies

Wallets

Ledger

Transactions

Exchange

Payments

Merchant

Notifications

Compliance

Administration
```

Each module owns its business rules and exposes only well-defined interfaces.

Direct coupling between unrelated modules should be avoided.

---

# Alternatives Considered

## Traditional Monolith

Pros

- Very simple
- Fast initial development

Cons

- Difficult to maintain
- Weak domain separation
- Higher coupling
- Poor scalability

Decision

Rejected.

---

## Microservices

Pros

- Independent deployments
- Independent scalability
- Strong service isolation

Cons

- High operational complexity
- Service discovery
- Distributed transactions
- Higher infrastructure cost
- Increased development overhead

Decision

Deferred until business growth justifies it.

---

## Modular Monolith

Pros

- Clear domain boundaries
- Lower infrastructure costs
- Easier deployments
- Excellent maintainability
- Easier onboarding
- Excellent developer productivity

Decision

Accepted.

---

# Benefits

The chosen architecture provides:

- Simple deployments
- Strong modularity
- High maintainability
- Faster development
- Lower infrastructure costs
- Better automated testing
- Easier debugging
- Clear business ownership
- Reduced operational complexity

---

# Module Communication

Modules communicate through Services only.

Allowed:

```text
Controller

↓

Service

↓

Repository
```

Cross-module communication:

```text
Wallet Service

↓

Ledger Service
```

Avoid:

```text
Controller

↓

Repository of another module
```

Repositories must never be accessed directly by another module.

---

# Layer Responsibilities

## Controllers

Responsible for:

- Receiving HTTP requests
- Input validation
- Calling services
- Returning HTTP responses

Controllers never contain business rules.

---

## Services

Responsible for:

- Business logic
- Domain validation
- Transactions
- Cross-module orchestration

---

## Repositories

Responsible only for persistence.

Repositories never contain business rules.

---

## Domain

Contains domain models and financial concepts.

---

# Future Evolution

If business growth requires independent scaling, modules may gradually evolve into microservices.

Likely candidates:

- Payments
- Exchange
- Merchant
- Notifications

Migration will occur only when justified by measurable business or operational needs.

---

# Consequences

## Positive

- Faster delivery
- Better maintainability
- Easier onboarding
- Lower infrastructure cost
- Better code organization
- Easier testing
- Simpler deployments

## Negative

- Single deployment artifact
- Shared database
- Requires architectural discipline
- Risk of module coupling if boundaries are ignored

---

# Architectural Rules

The following rules are mandatory:

- Business logic belongs to Services.
- Controllers remain thin.
- Repositories perform persistence only.
- Every module owns its domain.
- Cross-module communication occurs only through Services.
- Financial operations must always pass through the Ledger.
- Public APIs must be documented using OpenAPI.
- Every feature requires automated tests.

---

# Decision Summary

| Item | Decision |
|------|----------|
| Architecture | Modular Monolith |
| Language | TypeScript |
| Framework | Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| Cache | Redis |
| Authentication | JWT |
| Documentation | OpenAPI First |

---

# References

- BLUEPRINT.md
- ADR-002 Database Decisions
- ADR-003 Financial Core