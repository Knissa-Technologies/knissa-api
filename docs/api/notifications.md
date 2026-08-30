# Notifications API

## Overview

The Notifications API provides authenticated access to the notification system of the Knissa Financial Platform.

The current implementation supports in-app notifications and provides an extensible architecture for additional notification channels such as email, SMS, push notifications and WhatsApp.

Notifications are associated with an `Account` and access is restricted according to the authenticated user's account ownership.

---

# Base Route

```text
/notifications
```

All notification endpoints require JWT authentication.

```http
Authorization: Bearer <access_token>
```

---

# Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/notifications` | Create a notification |
| GET | `/notifications` | List current user's notifications |
| GET | `/notifications/unread-count` | Get unread notification count |
| GET | `/notifications/:id` | Get notification by ID |
| PATCH | `/notifications/:id/read` | Mark notification as read |

---

# 1. Create Notification

Creates a notification associated with an account.

```http
POST /notifications
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
  "type": "SYSTEM",
  "channel": "IN_APP",
  "priority": "NORMAL",
  "title": "Welcome to Knissa",
  "message": "Your notifications system is working successfully."
}
```

## Request Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| `accountId` | string | Yes | Account receiving the notification |
| `type` | string | Yes | Notification type |
| `channel` | string | Yes | Notification delivery channel |
| `priority` | string | Yes | Notification priority |
| `title` | string | Yes | Notification title |
| `message` | string | Yes | Notification message |

## Example Response

```json
{
  "success": true,
  "message": "Notification created successfully.",
  "data": {
    "id": "446ac9c5-46db-4e4e-930a-3b17f78513fb",
    "notificationNumber": "NTF-974B5871AB40",
    "accountId": "544fb14c-1c3e-4441-8191-0c07c00876f3",
    "templateId": null,
    "providerId": null,
    "providerReference": null,
    "type": "SYSTEM",
    "channel": "IN_APP",
    "status": "PENDING",
    "priority": "NORMAL",
    "subject": null,
    "title": "Welcome to Knissa",
    "message": "Your notifications system is working successfully.",
    "scheduledAt": null,
    "sentAt": null,
    "deliveredAt": null,
    "readAt": null,
    "failedAt": null,
    "createdAt": "2026-08-28T00:27:31.137Z",
    "updatedAt": "2026-08-28T00:27:31.137Z"
  }
}
```

---

# 2. List Notifications

Returns notifications belonging to accounts accessible by the authenticated user.

```http
GET /notifications
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
  "message": "Notifications retrieved successfully.",
  "data": [
    {
      "id": "446ac9c5-46db-4e4e-930a-3b17f78513fb",
      "notificationNumber": "NTF-974B5871AB40",
      "accountId": "544fb14c-1c3e-4441-8191-0c07c00876f3",
      "templateId": null,
      "providerId": null,
      "providerReference": null,
      "type": "SYSTEM",
      "channel": "IN_APP",
      "status": "PENDING",
      "priority": "NORMAL",
      "subject": null,
      "title": "Welcome Rose",
      "message": "Your Knissa notifications system is working successfully.",
      "scheduledAt": null,
      "sentAt": null,
      "deliveredAt": null,
      "readAt": null,
      "failedAt": null,
      "createdAt": "2026-08-28T00:27:31.137Z",
      "updatedAt": "2026-08-28T00:27:31.137Z"
    }
  ]
}
```

## Empty Result

When there are no notifications:

```json
{
  "success": true,
  "message": "Notifications retrieved successfully.",
  "data": []
}
```

---

# 3. Get Unread Notification Count

Returns the number of unread notifications available to the authenticated user.

```http
GET /notifications/unread-count
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
  "data": {
    "count": 1
  }
}
```

When all notifications have been read:

```json
{
  "success": true,
  "data": {
    "count": 0
  }
}
```

---

# 4. Get Notification By ID

Returns a specific notification.

```http
GET /notifications/:id
```

## Authentication

Required.

```http
Authorization: Bearer <access_token>
```

## Path Parameter

| Parameter | Type | Description |
|---|---|---|
| `id` | UUID | Notification ID |

## Example

```http
GET /notifications/446ac9c5-46db-4e4e-930a-3b17f78513fb
```

## Success Response

```json
{
  "success": true,
  "data": {
    "id": "446ac9c5-46db-4e4e-930a-3b17f78513fb",
    "notificationNumber": "NTF-974B5871AB40",
    "accountId": "544fb14c-1c3e-4441-8191-0c07c00876f3",
    "templateId": null,
    "providerId": null,
    "providerReference": null,
    "type": "SYSTEM",
    "channel": "IN_APP",
    "status": "PENDING",
    "priority": "NORMAL",
    "subject": null,
    "title": "Welcome Rose",
    "message": "Your Knissa notifications system is working successfully.",
    "scheduledAt": null,
    "sentAt": null,
    "deliveredAt": null,
    "readAt": null,
    "failedAt": null,
    "createdAt": "2026-08-28T00:27:31.137Z",
    "updatedAt": "2026-08-28T00:27:31.137Z"
  }
}
```

## Notification Not Found

```json
{
  "success": false,
  "message": "Notification not found."
}
```

The endpoint must not expose notifications belonging to accounts outside the authenticated user's accessible accounts.

---

# 5. Mark Notification As Read

Marks a notification as read.

```http
PATCH /notifications/:id/read
```

## Authentication

Required.

```http
Authorization: Bearer <access_token>
```

## Path Parameter

| Parameter | Type | Description |
|---|---|---|
| `id` | UUID | Notification ID |

## Example

```http
PATCH /notifications/446ac9c5-46db-4e4e-930a-3b17f78513fb/read
```

## Success Response

```json
{
  "success": true,
  "message": "Notification marked as read successfully.",
  "data": {
    "id": "446ac9c5-46db-4e4e-930a-3b17f78513fb",
    "notificationNumber": "NTF-974B5871AB40",
    "accountId": "544fb14c-1c3e-4441-8191-0c07c00876f3",
    "templateId": null,
    "providerId": null,
    "providerReference": null,
    "type": "SYSTEM",
    "channel": "IN_APP",
    "status": "READ",
    "priority": "NORMAL",
    "subject": null,
    "title": "Welcome Rose",
    "message": "Your Knissa notifications system is working successfully.",
    "scheduledAt": null,
    "sentAt": null,
    "deliveredAt": null,
    "readAt": "2026-08-28T00:37:01.431Z",
    "failedAt": null,
    "createdAt": "2026-08-28T00:27:31.137Z",
    "updatedAt": "2026-08-28T00:37:01.434Z"
  }
}
```

After marking the notification as read, the unread count is reduced accordingly.

Example:

```json
{
  "success": true,
  "data": {
    "count": 0
  }
}
```

---

# Notification Model

A notification contains the following main properties:

| Field | Description |
|---|---|
| `id` | Unique notification identifier |
| `notificationNumber` | Human-readable notification reference |
| `accountId` | Account receiving the notification |
| `templateId` | Optional notification template |
| `providerId` | Optional external provider |
| `providerReference` | Optional provider reference |
| `type` | Notification type |
| `channel` | Delivery channel |
| `status` | Current notification status |
| `priority` | Notification priority |
| `subject` | Optional subject |
| `title` | Notification title |
| `message` | Notification message |
| `scheduledAt` | Optional scheduled delivery time |
| `sentAt` | Delivery sent timestamp |
| `deliveredAt` | Delivery confirmation timestamp |
| `readAt` | Timestamp when notification was read |
| `failedAt` | Timestamp when delivery failed |
| `createdAt` | Creation timestamp |
| `updatedAt` | Last update timestamp |

---

# Notification Types

The notification domain is designed to support different business event categories.

Examples include:

```text
SYSTEM
SECURITY
LOGIN
MFA
PAYMENT
TRANSFER
DEPOSIT
WITHDRAWAL
EXCHANGE
KYC
MARKETING
```

The exact values must remain synchronized with the Prisma schema and application enums.

---

# Notification Channels

The architecture supports multiple delivery channels:

```text
IN_APP
EMAIL
SMS
PUSH
WHATSAPP
```

The currently implemented and tested notification flow uses:

```text
IN_APP
```

Additional channels are part of the extensible provider architecture.

---

# Notification Priorities

Supported notification priorities are designed around:

```text
LOW
NORMAL
HIGH
CRITICAL
```

---

# Notification Status

The notification lifecycle supports statuses such as:

```text
PENDING
PROCESSING
SENT
DELIVERED
READ
FAILED
CANCELLED
```

A typical in-app notification lifecycle is:

```text
PENDING
   ↓
READ
```

External delivery channels may use:

```text
PENDING
   ↓
PROCESSING
   ↓
SENT
   ↓
DELIVERED
```

Failures may result in:

```text
PENDING
   ↓
PROCESSING
   ↓
FAILED
```

---

# Ownership and Authorization

Notifications are account-scoped.

The access model is:

```text
Authenticated User
        ↓
Profile
        ↓
Account
        ↓
Notification
```

The authenticated user can only access notifications associated with accounts they are authorized to access.

This rule applies to:

- Listing notifications
- Retrieving notifications
- Marking notifications as read

---

# Security Considerations

The notification system must:

- Require authentication.
- Enforce account ownership.
- Prevent cross-account notification access.
- Validate notification identifiers.
- Avoid exposing sensitive provider credentials.
- Avoid exposing internal provider secrets.
- Maintain notification auditability.
- Preserve timestamps for notification lifecycle events.

---

# Provider Architecture

The notification domain is designed to support external providers.

Future provider integrations may include:

```text
Email Provider
      ↓
SMS Provider
      ↓
Push Provider
      ↓
WhatsApp Provider
```

The notification entity provides fields for:

```text
providerId
providerReference
sentAt
deliveredAt
failedAt
```

This allows delivery infrastructure to evolve without changing the core notification domain.

---

# Current Implementation Status

| Capability | Status |
|---|:---:|
| Create Notification | ✅ |
| List Notifications | ✅ |
| Get Notification | ✅ |
| Unread Count | ✅ |
| Mark as Read | ✅ |
| In-App Channel | ✅ |
| Account Ownership | ✅ |
| JWT Authentication | ✅ |
| Notification Providers | Architecture Ready |
| Email Delivery | Future |
| SMS Delivery | Future |
| Push Delivery | Future |
| WhatsApp Delivery | Future |

---

# Related API Routes

```text
POST   /notifications
GET    /notifications
GET    /notifications/unread-count
GET    /notifications/:id
PATCH  /notifications/:id/read
```

---

# Frontend Integration

The Knissa frontend can consume the notification API using the authenticated user's JWT.

Typical frontend flow:

```text
User Login
    ↓
JWT Access Token
    ↓
GET /notifications
    ↓
Display Notifications
    ↓
GET /notifications/unread-count
    ↓
Display Badge
    ↓
PATCH /notifications/:id/read
    ↓
Update Notification State
    ↓
Refresh Unread Count
```

This API contract is intended to provide the foundation for the future Knissa Web notification center.
