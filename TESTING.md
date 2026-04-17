# TESTING.md — How to Run & Test the Handshake Flow

Follow these steps in order. Each section can be run independently once prerequisites are met.

---

## Step 1 — Prerequisites

Make sure the following are installed:

| Tool | Check command | Min version |
|---|---|---|
| Node.js | `node -v` | 18+ |
| npm | `npm -v` | 9+ |
| MongoDB | `mongod --version` | 6+ |

> If MongoDB is not installed locally, use Docker (see Step 2b).

---

## Step 2a — Start MongoDB (local install)

```powershell
# Windows — run in a separate terminal and keep it open
mongod --dbpath C:\data\db
```

If `C:\data\db` doesn't exist yet:
```powershell
mkdir C:\data\db
mongod --dbpath C:\data\db
```

---

## Step 2b — Start MongoDB (Docker alternative)

```powershell
docker run -d --name mongo -p 27017:27017 mongo:6
```

---

## Step 3 — Install dependencies

```powershell
cd C:\Users\Akshay\Documents\Task\Pronti-app
npm install
```

---

## Step 4 — Set up environment variables

```powershell
# Copy the example env file
copy .env.example .env
```

The default `.env` will contain:
```
MONGO_URI=mongodb://localhost:27017/pronti
PORT=3000
```

No changes needed if MongoDB is running on the default port.

---

## Step 5 — Start the application

```powershell
npm run start:dev
```

You should see:
```
GraphQL ready at http://localhost:3000/graphql
gRPC listening on :50051
```

---

## Step 6 — Run unit tests

Open a **second terminal** (keep the app running in the first):

```powershell
cd C:\Users\Akshay\Documents\Task\Pronti-app

# Run all unit tests
npm test

# Run with coverage report
npm run test:cov
```

Expected output — all tests green:
```
PASS  test/handshake.service.spec.ts  (7 tests)
PASS  test/handshake.resolver.spec.ts (4 tests)
```

---

## Step 7 — Test the GraphQL API (browser)

1. Open: **http://localhost:3000/graphql**
2. Paste this mutation and click ▶ Run:

### Without persisting to DB (`persist: false`)
```graphql
mutation {
  takeHomeHandshake(
    candidateId: "cand-001"
    message: "Hello Pronti!"
    persist: false
  ) {
    success
    reply
    persisted
    timestamp
  }
}
```

Expected response:
```json
{
  "data": {
    "takeHomeHandshake": {
      "success": true,
      "reply": "Hey cand-001, got your message: \"Hello Pronti!\". Handshake complete.",
      "persisted": false,
      "timestamp": "2026-..."
    }
  }
}
```

### With persisting to DB (`persist: true`)
```graphql
mutation {
  takeHomeHandshake(
    candidateId: "cand-001"
    message: "Hello Pronti!"
    persist: true
  ) {
    success
    reply
    persisted
    timestamp
  }
}
```

Expected response: same as above but `"persisted": true`

---

## Step 8 — Verify MongoDB write

After running with `persist: true`, open a new terminal:

```powershell
# Connect to MongoDB shell
mongosh

# Switch to the pronti database
use pronti

# Query the handshakes collection
db.handshakes.find().pretty()
```

You should see a document like:
```json
{
  "_id": "...",
  "candidateId": "cand-001",
  "message": "Hello Pronti!",
  "reply": "Hey cand-001, got your message: \"Hello Pronti!\". Handshake complete.",
  "createdAt": "...",
  "updatedAt": "..."
}
```

Verify the index exists:
```js
db.handshakes.getIndexes()
// Should show an index on { candidateId: 1 }
```

---

## Step 9 — Test the gRPC endpoint (optional)

Install [grpcurl](https://github.com/fullstorydev/grpcurl/releases) and run:

```powershell
grpcurl -plaintext -d '{
  "candidateId": "cand-grpc",
  "message": "Testing via gRPC",
  "persist": true
}' -proto src/proto/handshake.proto localhost:50051 handshake.HandshakeService/takeHomeHandshake
```

Expected response:
```json
{
  "success": true,
  "reply": "Hey cand-grpc, got your message: \"Testing via gRPC\". Handshake complete.",
  "persisted": true,
  "timestamp": "..."
}
```

---

## Quick Reference

| Action | Command |
|---|---|
| Start app | `npm run start:dev` |
| Run tests | `npm test` |
| Tests + coverage | `npm run test:cov` |
| GraphQL playground | http://localhost:3000/graphql |
| gRPC port | `localhost:50051` |
| MongoDB DB name | `pronti` |
| MongoDB collection | `handshakes` |
