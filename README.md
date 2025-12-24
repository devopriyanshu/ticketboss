# TicketBoss

TicketBoss is a backend service that manages real-time seat reservations for events. It ensures no overselling through optimistic concurrency control, supports concurrent reservations, and provides instant accept/deny responses.

## Features

- Automatic event seeding on first startup
- Real-time seat reservation (max 10 seats per request)
- Safe cancellation with seat rollback
- Optimistic locking to prevent overselling
- PostgreSQL (Neon) with transactional integrity
- Clean layered architecture (routes, controllers, services, models)

## Tech Stack

- Node.js
- Express.js
- PostgreSQL (Neon Serverless DB)
- REST API

## Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd ticketboss
npm install
```

## Configuration

Create a `.env` file in the root directory:

```bash
touch .env
```

Add the following configuration:

```env
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
PORT=3000
```

Set up the database tables:

```sql
CREATE TABLE events (
  event_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  total_seats INT NOT NULL CHECK (total_seats > 0),
  available_seats INT NOT NULL CHECK (available_seats >= 0),
  version INT NOT NULL
);

CREATE TABLE reservations (
  id UUID PRIMARY KEY,
  event_id TEXT REFERENCES events(event_id),
  partner_id TEXT NOT NULL,
  seats INT NOT NULL CHECK (seats > 0),
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Usage

Start the application:

```bash
npm run dev
```

Expected output:

```
Connected to Neon DB
✅ Event seeded on startup
TicketBoss running on port 3000
```

On first startup, the database is seeded with:

```json
{
  "eventId": "node-meetup-2025",
  "name": "Node.js Meet-up",
  "totalSeats": 500,
  "availableSeats": 500,
  "version": 0
}
```

## API Documentation

**Postman Collection:** [View API Documentation](https://documenter.getpostman.com/view/40100824/2sBXVZoEKS)

### 1. Get Event Summary

Get current event details including available seats and reservation count.

**Endpoint:** `GET /reservations`

**Response:** `200 OK`

```json
{
  "eventId": "node-meetup-2025",
  "name": "Node.js Meet-up",
  "totalSeats": 500,
  "availableSeats": 42,
  "reservationCount": 458,
  "version": 14
}
```

### 2. Reserve Seats

Create a new seat reservation for a partner.

**Endpoint:** `POST /reservations`

**Request Body:**

```json
{
  "partnerId": "abc-corp",
  "seats": 3
}
```

**Responses:**

`201 Created` - Reservation successful

```json
{
  "reservationId": "550e8400-e29b-41d4-a716-446655440000",
  "seats": 3,
  "status": "confirmed"
}
```

`409 Conflict` - Not enough seats available

```json
{
  "error": "Not enough seats left"
}
```

`400 Bad Request` - Invalid seat count (seats ≤ 0 or > 10)

```json
{
  "error": "Seats must be between 1 and 10"
}
```

### 3. Cancel Reservation

Cancel an existing reservation and return seats to the pool.

**Endpoint:** `DELETE /reservations/:reservationId`

**Parameters:**

- `reservationId` (path parameter) - UUID of the reservation

**Responses:**

`204 No Content` - Cancellation successful (seats returned to pool)

`404 Not Found` - Reservation not found or already cancelled

```json
{
  "error": "Reservation not found"
}
```

### Example API Calls

```bash
# Get event summary
curl http://localhost:3000/api/reservations

# Create reservation
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"partnerId":"abc-corp","seats":3}'

# Cancel reservation
curl -X DELETE http://localhost:3000/api/reservations/reservationId
```

## Project Structure

```
src/
├── routes/
│   └── resRoutes.js              # API route definitions
├── controllers/
│   ├── eventController.js        # Event-related request handlers
│   └── resController.js          # Reservation request handlers
├── services/
│   ├── eventService.js           # Event business logic
│   └── resService.js             # Reservation business logic
├── models/
│   ├── eventModel.js             # Event database operations
│   └── resModel.js               # Reservation database operations
├── middleware/
│   └── errorMiddleware.js        # Global error handling
├── config/
│   └── db.js                 # Database connection setup
├── utils/
│   └── ApiError.js               # Custom error class
├── routes.js                     # Main route aggregator
├── app.js                        # Express app configuration
└── server.js                     # Application entry point
```

## Technical Decisions

### Architecture

The application follows a clean layered architecture pattern:

- **Routes Layer:** Defines API endpoints and maps them to controllers
- **Controllers Layer:** Handles HTTP requests/responses and validation
- **Services Layer:** Contains business logic and orchestrates operations
- **Models Layer:** Manages database operations and queries

This separation ensures maintainability, testability, and clear separation of concerns.

### Storage Method

**PostgreSQL (Neon Serverless)** was chosen for the following reasons:

- ACID compliance for transactional integrity
- Row-level locking support for concurrent operations
- Built-in optimistic locking through version fields
- Reliable and scalable for production workloads
- Serverless deployment reduces infrastructure overhead

### Optimistic Concurrency Control

The system uses optimistic locking to prevent overselling:

1. Each event has a `version` field that increments with every update
2. When reserving seats, the query checks the current version
3. If the version changed (another request modified it), the transaction fails
4. This ensures no two requests can reserve the same seats simultaneously

### Key Assumptions

- Single event system (node-meetup-2025 is hardcoded)
- Maximum 10 seats per reservation request
- Reservations are identified by UUID
- Partners can make multiple reservations
- Cancelled reservations cannot be reactivated
- Event details (name, total seats) are immutable after seeding

## Error Handling

The application includes comprehensive error handling:

- Input validation for all API requests
- Database constraint validation
- Concurrency conflict detection
- Meaningful error messages with appropriate HTTP status codes
- Global error middleware for consistent error responses
