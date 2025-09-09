# Technology Stack

## Frontend Framework

- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Pinia** for state management
- **Vue Router** for navigation

## Desktop Application

- **Electron** for cross-platform desktop deployment
- **Vite** as build tool and dev server
- **vite-plugin-electron** for Electron integration

## Database & ORM

- **SQLite** for local data storage
- **Drizzle ORM** for database operations
- **better-sqlite3** as SQLite driver

## Development Tools

- **ESLint** for code linting
- **Vitest** for unit testing
- **Vue Test Utils** for component testing
- **TypeScript** compiler with strict mode

## Build System

- **Vite** for fast development and optimized builds
- **electron-builder** for packaging desktop applications
- **npm-run-all2** for running parallel scripts

## Common Commands

### Development

```bash
npm run electron:dev    # Start Electron app in development mode
npm run dev            # Start Vite dev server only
npm run type-check     # Run TypeScript type checking
npm run lint           # Run ESLint with auto-fix
```

### Testing

```bash
npm run test:unit      # Run unit tests with Vitest
```

### Database

```bash
npm run db:generate    # Generate new database migrations
npm run db:migrate     # Apply database migrations
```

### Building

```bash
npm run build          # Build for production (web)
npm run electron:build # Build and package Electron app
npm run preview        # Preview production build
```

## Node.js Requirements

- Node.js 20.19.0+ or 22.12.0+
- Uses ES modules (`"type": "module"`)

## Key Dependencies

- `vue@^3.5.18` - Frontend framework
- `electron@^38.0.0` - Desktop app framework
- `drizzle-orm@^0.44.5` - Database ORM
- `better-sqlite3@^12.2.0` - SQLite driver
- `pinia@^3.0.3` - State management
