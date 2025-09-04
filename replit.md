# Overview

InstructorMatch is a full-stack web application built as a marketplace platform connecting companies with professional instructors for corporate training. The platform allows companies to post training requests and instructors to create profiles and apply for training opportunities. Built with React, Express, TypeScript, and PostgreSQL, it features real-time matching capabilities and a comprehensive user management system.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client application is built using React with TypeScript, leveraging a component-based architecture with modern React patterns. The UI is built using shadcn/ui components with Radix UI primitives, providing accessible and consistent design elements. The application uses Wouter for client-side routing, offering a lightweight alternative to React Router. State management is handled through TanStack Query (React Query) for server state and React's built-in state management for local component state.

The application follows a modular structure with separate directories for components, pages, hooks, and utilities. The component architecture separates reusable UI components from page-specific components, promoting code reusability and maintainability.

## Backend Architecture
The server is built with Express.js and TypeScript, following RESTful API principles. The architecture separates concerns through distinct modules:
- Routes handling (API endpoints)
- Authentication middleware using Replit Auth with OpenID Connect
- Database operations through a storage layer abstraction
- Session management using PostgreSQL-backed sessions

The server implements a layered architecture with clear separation between routing, business logic, and data access layers.

## Data Storage
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The database schema is defined using Drizzle's schema definition with proper TypeScript typing. Neon Database is used as the PostgreSQL provider with serverless connection pooling for scalability.

The schema includes tables for users, companies, instructors, training requests, applications, contracts, payments, reviews, and notifications, supporting the complete marketplace workflow.

## Authentication System
Authentication is implemented using Replit's OpenID Connect integration, providing secure user authentication and session management. The system supports role-based access with two user types: companies and instructors. Sessions are stored in PostgreSQL using connect-pg-simple middleware, ensuring persistent authentication across requests.

User profiles are dynamically created based on user type selection, with additional profile data stored in separate company and instructor tables linked to the main users table.

## UI Design System
The application uses a comprehensive design system built on top of shadcn/ui and Radix UI. The design system includes:
- CSS custom properties for consistent theming
- Tailwind CSS for utility-first styling
- Font Awesome icons for consistent iconography
- Responsive design patterns for mobile and desktop experiences

The styling approach combines utility classes with component-level styling, ensuring design consistency while maintaining flexibility for custom components.

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database provider
- **Drizzle ORM**: Type-safe database toolkit with schema management
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Authentication Services
- **Replit Auth**: OpenID Connect authentication provider
- **openid-client**: OpenID Connect client implementation
- **Passport.js**: Authentication middleware for Node.js

## Frontend Libraries
- **React**: Core frontend framework with TypeScript support
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **shadcn/ui**: Component library built on Radix UI
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing and optimization

## Session and State Management
- **Express Session**: Server-side session management
- **Memoizee**: Function memoization for performance optimization
- **Date-fns**: Date manipulation utilities

The application is configured for deployment on Replit with specific environment variables and development tooling optimized for the Replit environment.