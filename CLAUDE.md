# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development Server:**
- `npm run dev` - Start development server on port 4000 with Turbopack
- `npm start` - Start production server on port 4000
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

**Database Management:**
- Database migrations are located in `supabase/migrations/`
- Run `scripts/test-db.js` to test database connectivity
- Initialize database with `scripts/init-db.sql`

## Architecture Overview

### Tech Stack
- **Framework:** Next.js 15 with App Router
- **Database:** Supabase (PostgreSQL with RLS)
- **Auth:** Supabase Auth with SSR
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** Zustand with persistence
- **Editor:** Monaco Editor for code/markdown editing
- **PDF Generation:** Puppeteer for LaTeX/Markdown to PDF

### Project Structure

**Core Application:**
- `app/` - Next.js App Router pages and layouts
  - `dashboard/` - Main application interface
  - `auth/` - Authentication flows
  - `api/` - API routes for file operations, exports
- `components/` - React components organized by feature
  - `dashboard/` - File management, editor, preview components
  - `ui/` - shadcn/ui base components
- `lib/` - Core utilities
  - `supabase/` - Database client configurations
  - `store.ts` - Zustand state management
  - `types.ts` - TypeScript type definitions

**Database Schema:**
- `profiles` - User profile information
- `folders` - Hierarchical folder structure
- `files` - File metadata and content
- `shares` - Public sharing functionality
- `likes` - User interactions
- `comments` - Comment system

### Key Features

**File Management System:**
- Hierarchical folder structure with path-based organization
- Support for markdown, PDF, images, and document files
- File content stored in database (markdown) or Supabase Storage (binaries)
- Drag-and-drop file upload with progress tracking

**Editor Interface:**
- Monaco Editor for markdown/code editing
- Real-time preview panel with LaTeX/math support
- Resizable panels with state persistence
- Table of contents generation for markdown files

**Authentication & Authorization:**
- Supabase Auth with email/password
- Row Level Security (RLS) policies
- User profiles with admin capabilities
- Session persistence across app components

**Export & Sharing:**
- PDF export with LaTeX rendering (via Puppeteer)
- Public sharing with view counters
- Bulk export as ZIP archives
- Social features (likes, comments)

### State Management

The app uses Zustand with the following key state slices:
- User authentication state
- File system navigation (folders, files, current selection)
- Editor state (active file, content, dirty state)
- UI state (sidebar, preview panel visibility)
- Loading and error states

### Database Integration

**Supabase Clients:**
- `lib/supabase/client.ts` - Browser client for client components
- `lib/supabase/server.ts` - Server client for server components/actions
- `lib/supabase/middleware.ts` - Auth middleware for route protection

**RLS Policies:**
- All data is user-scoped via RLS policies
- Admin users have elevated permissions
- Public shares have read-only access without authentication

### Development Notes

**Next.js Configuration:**
- Custom webpack config for client-side fallbacks
- Image optimization for Supabase Storage
- TypeScript strict mode enabled
- ESLint configuration for code quality

**Performance Considerations:**
- Turbopack for fast development builds
- Component-level code splitting
- Optimized image loading
- Persistent state for UI preferences

**File Upload System:**
- Multi-file drag-and-drop support
- Progress tracking per file
- Automatic file type detection
- Integration with Supabase Storage

The application is designed as a full-featured cloud note-taking system with collaborative features, supporting both technical documentation (with LaTeX) and general note-taking workflows.