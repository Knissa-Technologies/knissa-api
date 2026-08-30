# API Keys API

## Overview

The API Keys module provides secure API credential management for the Knissa Financial Platform.

API keys are associated with accounts and are intended to provide a foundation for future external integrations, developer access and the Knissa Public API.

The current implementation supports the complete API key lifecycle:

```text
Create
  ↓
Active
  ↓
Revoke
  ↓
Delete
```

API keys require authenticated access through JWT.

---

# Base Route

```text
/api-keys
```

All API key management endpoints require authentication.

```http
Authorization: Bearer <access_token>
```

---

# Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api-keys` | Create an API key |
| GET | `/api-keys` | List API keys |
| GET | `/api-keys/:id` | Get API key by ID |
| PATCH | `/api-keys/:id/revoke` | Revoke an API key |
| DELETE | `/api-keys/:id` | Delete an API key |

---

# 1. Create API Key

Creates a new API key associated with an account accessible by the authenticated user.

```http
POST /api-keys
```

## Authentication

Required.

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Request Body

```json
{
  "accountId": "544fb14c-1c3e-4441-8191-0c07c00876f3",
  "name": "Knissa Test API Key"
}
```

## Request Fields

| Field | Type | Required | Description |
|---|---|:---:|---|
| `accountId` | UUID | Yes | Account associated with the API key |
| `name` | string | Yes | Human-readable API key name |
| `expiresAt` | datetime | No | Optional expiration date |

## Example Response

```json
{
  "success": true,
  "message": "API key created successfully.",
  "data": {
    "id": "cbf7c778-b088-4e62-b8c5-490c86446d5a",
    "apiKeyNumber": "KEY-8C1CC80A97FE",
    "accountId": "544fb14c-1c3e-4441-8191-0c07c00876f3",
    "name": "Knissa Test API Key",
    "prefix": "kn_live_7462",
    "keyHash": "a8fe305b66e42d17b5055f1837841683e7009b54cb203d640522d6c7cfb5e13e",
    "environment": "TEST",
    "status": "ACTIVE",
    "scopes": [],
    "lastUsedAt": null,
    "expiresAt": null,
    "revokedAt": null,
    "createdAt": "2026-08-28T01:59:23.721Z",
    "updatedAt": "2026-08-28T01:59:23.721Z",
    "key": "kn_live_xxxxxxxxxxxxxxxxxxxxxxxxx"
  }
}
```

---

# API Key Secret

The raw API key is generated when the API key is created.

Example format:

```text
kn_live_xxxxxxxxxxxxxxxxxxxxxxxxx
```

The API stores a cryptographic hash of the secret instead of storing the raw secret.

The raw `key` value is returned during creation and should be treated as a sensitive credential.

Clients should store the secret securely.

The raw secret must not be committed to source control, logs or public documentation.

---

# API Key Number

Every API key receives a unique human-readable identifier.

Example:

```text
KEY-8C1CC80A97FE
```

The `apiKeyNumber` is different from the raw API key secret.

It is intended for:

- Identification
- Support
- Administration
- Auditing
- User interfaces

---

# API Key Prefix

Every API key contains a prefix used to identify the key without exposing the complete secret.

Example:

```text
kn_live_7462
```

The prefix can be safely used for identification purposes, while the complete secret remains private.

---

# 2. List API Keys

Returns API keys associated with accounts accessible by the authenticated user.

```http
GET /api-keys
```

## Authentication

Required.

```http
Authorization: Bearer <access_token>
```

## Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": "cbf7c778-b088-4e62-b8c5-490c86446d5a",
      "apiKeyNumber": "KEY-8C1CC80A97FE",
      "accountId": "544fb14c-1c3e-4441-8191-0c07c00876f3",
      "name": "Knissa Test API Key",
      "prefix": "kn_live_7462",
      "keyHash": "a8fe305b66e42d17b5055f1837841683e7009b54cb203d640522d6c7cfb5e13e",
      "environment": "TEST",
      "status": "ACTIVE",
      "scopes": [],
      "lastUsedAt": null,
      "expiresAt": null,
      "revokedAt": null,
      "createdAt": "2026-08-28T01:59:23.721Z",
      "updatedAt": "2026-08-28T01:59:23.721Z"
    }
  ]
}
```

The raw API key secret is not returned when listing API keys.

---

# Empty Result

When the authenticated user has no API keys:

```json
{
  "success": true,
  "data": []
}
```

---

# 3. Get API Key By ID

Retrieves a specific API key belonging to an account accessible by the authenticated user.

```http
GET /api-keys/:id
```

## Authentication

Required.

```http
Authorization: Bearer <access_token>
```

## Path Parameter

| Parameter | Type | Description |
|---|---|---|
| `id` | UUID | API key identifier |

## Example

```http
GET /api-keys/cbf7c778-b088-4e62-b8c5-490c86446d5a
```

## Success Response

```json
{
  "success": true,
  "data": {
    "id": "cbf7c778-b088-4e62-b8c5-490c86446d5a",
    "apiKeyNumber": "KEY-8C1CC80A97FE",
    "accountId": "544fb14c-1c3e-4441-8191-0c07c00876f3",
    "name": "Knissa Test API Key",
    "prefix": "kn_live_7462",
    "environment": "TEST",
    "status": "ACTIVE",
    "scopes": [],
    "lastUsedAt": null,
    "expiresAt": null,
    "revokedAt": null
  }
}
```

---

# API Key Not Found

```json
{
  "success": false,
  "message": "API key not found."
}
```

The API must not expose API keys belonging to accounts outside the authenticated user's accessible accounts.

---

# 4. Revoke API Key

Revokes an active API key.

```http
PATCH /api-keys/:id/revoke
```

## Authentication

Required.

```http
Authorization: Bearer <access_token>
```

## Path Parameter

| Parameter | Type | Description |
|---|---|---|
| `id` | UUID | API key identifier |

## Example

```http
PATCH /api-keys/cbf7c778-b088-4e62-b8c5-490c86446d5a/revoke
```

## Success Response

```json
{
  "success": true,
  "message": "API key revoked successfully.",
  "data": {
    "id": "cbf7c778-b088-4e62-b8c5-490c86446d5a",
    "apiKeyNumber": "KEY-8C1CC80A97FE",
    "accountId": "544fb14c-1c3e-4441-8191-0c07c00876f3",
    "name": "Knissa Test API Key",
    "prefix": "kn_live_7462",
    "environment": "TEST",
    "status": "REVOKED",
    "scopes": [],
    "lastUsedAt": null,
    "expiresAt": null,
    "revokedAt": "2026-08-28T13:03:00.969Z"
  }
}
```

Once revoked, an API key must no longer be considered active.

---

# Revoke Lifecycle

```text
ACTIVE
   ↓
REVOKED
```

Revocation preserves the API key record and records the `revokedAt` timestamp.

This allows the platform to maintain an auditable credential lifecycle.

---

# 5. Delete API Key

Deletes an API key.

```http
DELETE /api-keys/:id
```

## Authentication

Required.

```http
Authorization: Bearer <access_token>
```

## Example

```http
DELETE /api-keys/cbf7c778-b088-4e62-b8c5-490c86446d5a
```

## Success Response

```json
{
  "success": true,
  "message": "API key deleted successfully."
}
```

Deletion removes the API key from the active API key collection.

---

# API Key Lifecycle

The complete management lifecycle is:

```text
                ┌─────────────┐
                │   CREATED   │
                └──────┬──────┘
                       │
                       ▼
                ┌─────────────┐
                │    ACTIVE   │
                └──────┬──────┘
                       │
                       ▼
                ┌─────────────┐
                │   REVOKED   │
                └──────┬──────┘
                       │
                       ▼
                ┌─────────────┐
                │   DELETED   │
                └─────────────┘
```

Expiration can also affect the lifecycle:

```text
ACTIVE
   ↓
EXPIRED
```

---

# API Key Status

The API key model supports lifecycle states including:

```text
ACTIVE
REVOKED
EXPIRED
```

The current implementation has been tested with:

```text
ACTIVE
REVOKED
```

---

# API Key Environment

API keys support environment classification.

Current environment architecture includes:

```text
TEST
LIVE
```

Example:

```json
{
  "environment": "TEST"
}
```

The environment allows Knissa to distinguish credentials intended for testing from credentials intended for production integrations.

---

# Scopes

API keys support a scope architecture through the `scopes` field.

Example:

```json
{
  "scopes": []
}
```

The current implementation supports storing scopes, while the detailed public permission model can evolve with the future developer API.

Potential future scopes include:

```text
payments:read
payments:write
wallets:read
wallets:write
transactions:read
transactions:write
accounts:read
accounts:write
```

These examples represent future API authorization capabilities and are not necessarily active permissions in the current implementation.

---

# Ownership and Authorization

API keys are associated with an `Account`.

The ownership model is:

```text
Authenticated User
        ↓
Profile
        ↓
Account
        ↓
API Key
```

API key management operations must respect account ownership.

A user cannot manage API keys belonging to an account outside their authorized account scope.

This applies to:

- Creating API keys
- Listing API keys
- Retrieving API keys
- Revoking API keys
- Deleting API keys

---

# Security

API keys are sensitive credentials.

The implementation must follow these security principles:

- Require JWT authentication for API key management.
- Validate account ownership.
- Never expose the complete secret in list operations.
- Never store the raw secret as plaintext.
- Store only the cryptographic hash required for verification.
- Avoid logging raw API key secrets.
- Never commit API keys to source control.
- Treat API key creation responses as sensitive.
- Revoke compromised credentials immediately.

---

# API Key Storage

The API key persistence model contains fields such as:

```text
id
apiKeyNumber
accountId
name
prefix
keyHash
environment
status
scopes
lastUsedAt
expiresAt
revokedAt
createdAt
updatedAt
```

The separation between:

```text
prefix
```

and:

```text
keyHash
```

allows the platform to identify credentials without storing the original secret.

---

# Frontend Integration

The future Knissa Web frontend can provide an API key management interface.

Recommended frontend workflow:

```text
User Login
    ↓
JWT Access Token
    ↓
GET /api-keys
    ↓
Display API Keys
    ↓
POST /api-keys
    ↓
Display Raw Secret Once
    ↓
User Stores Secret Securely
    ↓
PATCH /api-keys/:id/revoke
    ↓
Update Status
    ↓
DELETE /api-keys/:id
```

The frontend should clearly warn users that the raw API key is sensitive and should be copied securely when presented after creation.

---

# Current Implementation Status

| Capability | Status |
|---|:---:|
| Create API Key | ✅ |
| List API Keys | ✅ |
| Get API Key | ✅ |
| Revoke API Key | ✅ |
| Delete API Key | ✅ |
| API Key Number | ✅ |
| API Key Prefix | ✅ |
| Hashed Secret Storage | ✅ |
| Environment Field | ✅ |
| Scope Architecture | ✅ |
| Account Ownership | ✅ |
| JWT Authentication | ✅ |
| Public API Authentication | Future |
| API Versioning | Future |
| Webhooks | Future |
| Developer Portal | Future |

---

# Tested API Flow

The API key lifecycle has been verified through the following operations:

```text
POST /api-keys
       ↓
API Key Created
       ↓
GET /api-keys
       ↓
API Key Listed
       ↓
GET /api-keys/:id
       ↓
API Key Retrieved
       ↓
PATCH /api-keys/:id/revoke
       ↓
API Key Revoked
       ↓
DELETE /api-keys/:id
       ↓
API Key Deleted
```

The complete lifecycle has been successfully exercised during backend development.

---

# Related Routes

```text
POST   /api-keys
GET    /api-keys
GET    /api-keys/:id
PATCH  /api-keys/:id/revoke
DELETE /api-keys/:id
```

---

# Future API Platform

The API Keys module provides the foundation for the future Knissa developer ecosystem.

Planned capabilities include:

- Public API
- API Documentation
- OpenAPI
- API Versioning
- Webhooks
- Developer Portal
- API Usage Analytics
- Rate Limits
- API Key Scopes
- Application Management
- Integration Management

The API key architecture should evolve without breaking existing authenticated resources whenever practical.
