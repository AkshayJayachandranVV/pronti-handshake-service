# Handshake Flow — Hiring Take-Home Notes

## Steps to run the implementation

1. **Prerequisites**: Node.js v18+ and a running instance of MongoDB locally (or via Docker).
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```
   *Ensure MongoDB is running (defaults to `mongodb://localhost:27017/pronti`).*
4. **Start the Application**:
   ```bash
   npm run start:dev
   ```
   *The GraphQL playground will be available at http://localhost:3000/graphql, and the gRPC server will listen on port 50051.*
5. **Run the Tests**:
   ```bash
   npm test
   # Or for coverage: npm run test:cov
   ```

## Assumptions Made

1. **GraphQL + gRPC Sharing Logic**: I assumed the requirement was to implement a unified service layer (`HandshakeService`) that handles the business logic, which is then exposed concurrently to both GraphQL (via `HandshakeResolver`) and gRPC (via `HandshakeGrpcController`). They both listen in the same NestJS application.
2. **MongoDB Fault-Tolerance**: I implemented the persistence layer under the assumption that if MongoDB becomes unavailable, it shouldn’t fatally crash the handshake response. The service catches persistence errors, logs them, and returns a graceful `success: true` but specifically flags `persisted: false`.
3. **Schema Simplicity**: The `Handshake` MongoDB schema was kept purposefully lean (just `candidateId`, `message`, `reply`, and timestamps) with an index on `candidateId`.

## Example GraphQL Request and Response

**Endpoint:** `http://localhost:3000/graphql`

**Request:**
```graphql
mutation {
  takeHomeHandshake(
    candidateId: "cand-001"
    message: "Hello Pronti Team!"
    persist: true
  ) {
    success
    reply
    persisted
    timestamp
  }
}
```

**Response:**
```json
{
  "data": {
    "takeHomeHandshake": {
      "success": true,
      "reply": "Hey cand-001, got your message: \"Hello Pronti Team!\". Handshake complete.",
      "persisted": true,
      "timestamp": "2026-04-17T13:40:00.000Z"
    }
  }
}
```

## Challenges Faced

1. **NestJS 11 GraphQL Setup**: NestJS recently upgraded to rely on Apollo Server v4 which shifted to a new Express integration standard. I had to manually install `@as-integrations/express5` to successfully bind the GraphQL schema to the Express application during boot.
2. **GraphQL "Query" Requirement**: Since this assignment strictly focused on a mutation (`takeHomeHandshake`), the application initially crashed because GraphQL enforces that a root schema MUST have at least one `@Query` defined. I added a simple, lightweight `ping` query to the resolver to satisfy the GraphQL specification while keeping the main logic focused on the mutation.
3. **Proto Compilation on Build**: Getting the `.proto` file correctly bundled inside the `dist` directory required tuning `nest-cli.json`. I added an `assets` definition to copy the proto files into `dist/` on build, and ensured that `test` files were excluded in `tsconfig.json` so the `dist` directory maintained a flat, predictable structure for resolving `__dirname`.
