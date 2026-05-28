# Aguka Frontend

Web frontend for the Aguka Smart Farming Kit - React 19 + Vite + TanStack Router + TailwindCSS.

## Prerequisites
- Node.js (version compatible with Vite 7.3.1)
- npm or yarn

## Installation

```bash
# Install dependencies
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Aguka Smart Farming Kit
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Building
npm run build            # Build for production
npm run build:dev        # Build for development mode
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
```

## Running the Application

```bash
# Development
npm run dev

# The application will be available at:
# http://localhost:5173
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

- `src/` - Source code
  - `api/` - API client and endpoints
  - `components/` - Reusable UI components
  - `hooks/` - Custom React hooks
  - `routes/` - Route components
  - `lib/` - Utility libraries
  - `utils/` - Utility functions
  - `main.tsx` - Application entry point
  - `router.tsx` - Router configuration
- `public/` - Static assets

## Tech Stack

- **React 19** - UI library
- **Vite 7** - Build tool and dev server
- **TanStack Router** - File-based routing
- **TanStack Query** - Data fetching and caching
- **TailwindCSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **Zod** - Schema validation
