# Pronti — Handshake Flow

A NestJS service implementing the `takeHomeHandshake` gRPC method, exposed via GraphQL, with conditional MongoDB persistence.

---

## What's in here

| Layer | File(s) |
|---|---|
| gRPC proto | `src/proto/handshake.proto` |
| gRPC server | `src/grpc/handshake.grpc.controller.ts` |
| GraphQL resolver | `src/graphql/handshake.resolver.ts` |
| GraphQL types | `src/graphql/handshake.types.ts` |
| Service logic | `src/handshake/handshake.service.ts` |
| Mongoose schema | `src/handshake/handshake.schema.ts` |
| Module wiring | `src/handshake/handshake.module.ts` |
| Bootstrap | `src/main.ts` |
| Unit tests | `test/` |

---

## Getting started

**Prerequisites:** Node 18+, MongoDB running locally (or update `MONGO_URI` in `.env`)

```bash
# Install dependencies
npm install

# Copy env file and adjust as needed
cp .env.example .env

# Start in dev mode (requires ts-node)
npm run start:dev

# Run unit tests
npm test
```

**GraphQL Playground:** `http://localhost:3000/graphql`

**gRPC endpoint:** `localhost:50051`

---

## The handshake flow

```graphql
mutation {
  takeHomeHandshake(
    candidateId: "cand-001"
    message: "Hello Pronti!"
    persist: true        # set to false to skip DB write
  ) {
    success
    reply
    persisted
    timestamp
  }
}
```

### What happens under the hood

1. GraphQL mutation hits `HandshakeResolver`
2. Resolver delegates to `HandshakeService.processHandshake()`
3. Service builds a reply string and checks the `persist` flag
4. If `persist: true` → writes `{ candidateId, message, reply }` to MongoDB
5. If `persist: false` → only acknowledges, no DB write
6. Response is returned regardless (service is resilient to Mongo failures)

The same `HandshakeService` is also reachable via gRPC at the same endpoint — the `HandshakeGrpcController` maps the proto method directly to the service.

---

## MongoDB

Collection: `handshakes`

```
{
  candidateId: string   // indexed
  message: string
  reply: string
  createdAt: Date       // auto via { timestamps: true }
  updatedAt: Date
}
```

Index on `candidateId` is set in the Mongoose schema so you can efficiently query all handshakes for a given candidate.

---

## Tests

```bash
npm test              # run all
npm run test:cov      # with coverage report
```

Tests live in `test/` and cover:
- `HandshakeService` — persist/no-persist paths, resilient error case, timestamp format
- `HandshakeResolver` — correct arg delegation, response passthrough

No integration tests here (would need a running Mongo) — just clean, fast unit tests with mocked dependencies.
