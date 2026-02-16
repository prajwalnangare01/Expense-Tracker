# SpendWise - Expense Tracker Application

## Overview

SpendWise is a personal finance expense tracking application that allows users to manage their expenses with features including expense creation, editing, deletion, category filtering, and spending analytics with visual charts. The application uses Supabase for authentication and database operations, with a React frontend and Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Animations**: Framer Motion for smooth page transitions and UI animations
- **Charts**: Recharts for data visualization (pie charts for expense breakdown)
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API endpoints defined in `shared/routes.ts` with Zod schemas for validation
- **Authentication**: Supabase Auth - backend validates user tokens passed in Authorization header
- **Database Access**: Uses Supabase client directly in `storage.ts` for CRUD operations
- **Schema Definition**: Drizzle ORM for PostgreSQL schema definition (used for type generation and potential direct DB access)

### Data Storage
- **Primary Database**: Supabase PostgreSQL (accessed via Supabase JS client)
- **Schema**: Single `expenses` table with fields: id, userId, title, amount, category, date, createdAt
- **ORM**: Drizzle ORM configured for PostgreSQL with schema in `shared/schema.ts`
- **Row Level Security**: Supabase RLS likely enforced via user_id column

### Authentication Flow
1. Frontend uses Supabase Auth for login/signup (email/password)
2. Session tokens stored client-side via Supabase SDK
3. API requests include `Authorization: Bearer <token>` header
4. Backend creates authenticated Supabase client per-request to enforce RLS

### Project Structure
```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # UI components (shadcn/ui + custom)
│   │   ├── hooks/        # Custom hooks (auth, expenses, toast)
│   │   ├── pages/        # Route pages (Dashboard, Expenses, Auth)
│   │   └── lib/          # Utilities and query client
├── server/               # Express backend
│   ├── routes.ts         # API route handlers
│   ├── storage.ts        # Supabase storage implementation
│   └── db.ts             # Drizzle DB connection (optional)
├── shared/               # Shared types and schemas
│   ├── schema.ts         # Drizzle table definitions
│   └── routes.ts         # API route definitions with Zod
└── migrations/           # Drizzle migration files
```

## External Dependencies

### Authentication & Database
- **Supabase**: Primary authentication provider and PostgreSQL database host
  - Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (frontend)
  - Environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (backend, falls back to VITE_ prefixed)

### Database Connection
- **PostgreSQL**: Via Supabase, with optional direct connection via `DATABASE_URL`
- **Drizzle ORM**: Schema definitions and type generation, can connect directly if `DATABASE_URL` is set

### Key NPM Packages
- `@supabase/supabase-js`: Supabase client for auth and database
- `drizzle-orm` / `drizzle-zod`: ORM and schema-to-Zod conversion
- `@tanstack/react-query`: Data fetching and caching
- `recharts`: Chart visualizations
- `framer-motion`: Animations
- `date-fns`: Date formatting
- `zod`: Runtime validation

### Build & Dev Tools
- **Vite**: Frontend bundler with HMR
- **esbuild**: Server bundling for production
- **TypeScript**: Full type safety across client/server/shared