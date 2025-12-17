# Learn Buddy

## Overview

Learn Buddy is a gamified learning platform that combines Tamagotchi-style virtual pet mechanics with evidence-based learning techniques. Designed for retail sales associates, it transforms mandatory training into an engaging daily habit through a virtual companion that grows alongside the user's knowledge. Users care for their creature by completing flashcard reviews, quizzes, and matching games, earning XP, coins, and unlocking achievements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack Query (React Query) for server state caching and synchronization
- **Styling**: Tailwind CSS with custom design tokens (lavender, mint, peach, sky color palette)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Typography**: Quicksand (playful headings) + Inter (body text) font pairing

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful JSON API with `/api` prefix
- **Build Tool**: Vite for client, esbuild for server bundling

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit with `db:push` command

### Project Structure
```
├── client/src/          # React frontend
│   ├── components/      # Reusable UI components
│   ├── pages/           # Route-based page components
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utilities and query client
├── server/              # Express backend
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Database access layer
│   └── seed.ts          # Initial data seeding
├── shared/              # Shared types and schema
└── attached_assets/     # Product documentation
```

### Key Design Patterns
- **Storage Interface**: `IStorage` interface in `server/storage.ts` abstracts database operations, allowing for potential storage backend changes
- **Query Invalidation**: Mutations invalidate related queries to keep UI in sync with server state
- **Demo User**: Auto-creates a demo user for unauthenticated access during development
- **Spaced Repetition**: Flashcard system uses confidence levels and review scheduling

## External Dependencies

### Database
- **PostgreSQL**: Primary data store via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and migrations
- **connect-pg-simple**: PostgreSQL session storage (configured but sessions not fully implemented)

### Frontend Libraries
- **@tanstack/react-query**: Server state management
- **framer-motion**: Animation library
- **wouter**: Client-side routing
- **date-fns**: Date manipulation utilities
- **Radix UI**: Accessible component primitives (dialog, dropdown, tabs, etc.)

### Build & Development
- **Vite**: Frontend dev server and bundler with HMR
- **esbuild**: Server-side bundling for production
- **tsx**: TypeScript execution for development

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay for development
- **@replit/vite-plugin-cartographer**: Replit integration
- **@replit/vite-plugin-dev-banner**: Development environment indicator