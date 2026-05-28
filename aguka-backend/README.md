# Aguka Backend API

Backend API for the Aguka Smart Farming Kit - Node.js + TypeScript + Express + Prisma + PostgreSQL.

## Prerequisites
- Node.js >= 18.0.0
- PostgreSQL (version compatible with Prisma 7.8.0)

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

## Environment Variables

Create a `.env` file based on `.env.example`. Required keys:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `API_VERSION` - API version (default: v1)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT secret key (min 32 chars)
- `JWT_REFRESH_SECRET` - JWT refresh secret key (min 32 chars)
- `JWT_EXPIRES_IN` - JWT token expiration
- `JWT_REFRESH_EXPIRES_IN` - JWT refresh token expiration
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Firebase client email
- `FIREBASE_PRIVATE_KEY` - Firebase private key
- `AFRICASTALKING_USERNAME` - Africa's Talking username
- `AFRICASTALKING_API_KEY` - Africa's Talking API key
- `AFRICASTALKING_SHORTCODE` - Africa's Talking shortcode
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number
- `MQTT_BROKER_URL` - MQTT broker URL
- `MQTT_USERNAME` - MQTT username
- `MQTT_PASSWORD` - MQTT password
- `SMTP_HOST` - SMTP host
- `SMTP_PORT` - SMTP port
- `SMTP_USER` - SMTP user
- `SMTP_PASSWORD` - SMTP password
- `FRONTEND_URL` - Frontend URL for CORS

## Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Building
npm run build            # Build TypeScript to dist/
npm start                # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run database migrations
npm run db:push          # Push schema changes to database
npm run db:seed          # Seed database with initial data
npm run db:studio        # Open Prisma Studio

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run typecheck        # Run TypeScript type checking
```

## Running the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Base URL

```
http://localhost:3000/api/v1
```

## Project Structure

- `src/` - Source code
  - `config/` - Configuration files
  - `controllers/` - Request handlers
  - `services/` - Business logic
  - `routes/` - API routes
  - `middleware/` - Express middleware
  - `validators/` - Request validation schemas
  - `utils/` - Utility functions
  - `types/` - TypeScript type definitions
  - `simulation/` - Sensor and irrigation simulation
  - `jobs/` - Scheduled jobs
  - `mail/` - Email templates and services
- `prisma/` - Database schema and migrations
- `public/` - Static files
