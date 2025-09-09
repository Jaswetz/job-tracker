# Project Structure

## Root Directory

```
job-search-tracker/
├── src/                    # Main application source code
├── electron/               # Electron main and preload processes
├── drizzle/               # Database migrations and metadata
├── public/                # Static assets
├── dist/                  # Build output (generated)
├── dist-electron/         # Electron build output (generated)
└── node_modules/          # Dependencies
```

## Source Code Organization (`src/`)

### Core Directories

- **`components/`** - Reusable Vue components
  - `__tests__/` - Component unit tests
  - `icons/` - SVG icon components
- **`views/`** - Page-level Vue components (routes)
- **`database/`** - Database schema and connection logic
- **`services/`** - Business logic and data access layer
  - `__tests__/` - Service unit tests
- **`types/`** - TypeScript type definitions and enums
- **`stores/`** - Pinia state management stores
- **`router/`** - Vue Router configuration
- **`assets/`** - CSS, images, and other static assets

## Key Files

### Configuration

- `package.json` - Dependencies and npm scripts
- `vite.config.ts` - Vite build configuration
- `drizzle.config.ts` - Database ORM configuration
- `tsconfig.*.json` - TypeScript compiler settings
- `eslint.config.ts` - ESLint rules and configuration

### Database

- `src/database/schema.ts` - Drizzle ORM schema definitions
- `src/database/connection.ts` - Database connection setup
- `drizzle/` - Generated migrations and metadata

### Electron

- `electron/main.ts` - Electron main process
- `electron/preload.ts` - Electron preload script
- `electron-builder.config.js` - App packaging configuration

## Naming Conventions

### Files & Directories

- **Components**: PascalCase (e.g., `HelloWorld.vue`)
- **Views**: PascalCase with "View" suffix (e.g., `HomeView.vue`)
- **Services**: camelCase (e.g., `database.ts`)
- **Types**: camelCase (e.g., `index.ts`)
- **Tests**: Match source file with `.test.ts` or `.spec.ts`

### Code

- **Enums**: PascalCase (e.g., `JobStatus`, `CompanyType`)
- **Interfaces**: PascalCase (e.g., `Job`, `Company`)
- **Database tables**: camelCase (e.g., `companies`, `jobContacts`)
- **Database columns**: snake_case (e.g., `job_title`, `linkedin_url`)

## Architecture Patterns

### Data Flow

1. **Views** consume data from **Stores** (Pinia)
2. **Stores** call **Services** for business logic
3. **Services** interact with **Database** layer
4. **Database** uses Drizzle ORM with **Schema** definitions

### Component Structure

- Reusable components in `components/`
- Page components in `views/`
- Icon components isolated in `components/icons/`
- Test files co-located with source files

### Database Design

- Relational design with foreign keys
- Separate tables for entities (jobs, companies, contacts)
- Junction table for many-to-many relationships (`jobContacts`)
- History tracking table (`jobStatusHistory`)
- Text-based IDs and date strings (SQLite compatibility)
