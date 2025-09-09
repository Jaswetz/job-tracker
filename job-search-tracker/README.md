# Job Search Tracker

A personal job search tracking application built with Vue 3, TypeScript, Electron, and SQLite.

## Features

- Track job applications with detailed information
- Manage company and contact relationships
- Local SQLite database for data privacy
- Cross-platform desktop application

## Development Setup

### Prerequisites

- Node.js 20.19.0 or higher
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
# Run in development mode with Electron
npm run electron:dev

# Run tests
npm run test:unit

# Type checking
npm run type-check

# Linting
npm run lint
```

### Database

```bash
# Generate database migrations
npm run db:generate

# Apply migrations (handled automatically in app)
npm run db:migrate
```

### Building

```bash
# Build for production
npm run build

# Build Electron app
npm run electron:build
```

## Project Structure

```
src/
├── components/          # Vue components
├── database/           # Database schema and connection
├── services/           # Business logic services
├── types/              # TypeScript type definitions
└── views/              # Vue pages/views

electron/
├── main.ts             # Electron main process
└── preload.ts          # Electron preload script

drizzle/                # Database migrations
```

## Technology Stack

- **Frontend**: Vue 3, TypeScript, Tailwind CSS, Pinia
- **Desktop**: Electron
- **Database**: SQLite with Drizzle ORM
- **Build**: Vite
- **Testing**: Vitest
