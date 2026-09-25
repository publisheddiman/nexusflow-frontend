# NodeWave Frontend

Frontend application for NodeWave Fullstack Engineer Assessment.

This application provides the user interface for project management
workflow with authentication, task management, dependency visualization,
and client-facing project visibility.

## Live Application

Frontend:

https://nodewave-fullstack-frontend.vercel.app

Backend API:

https://nodewave-fullstack-backend-production.up.railway.app

## Repository

Frontend Repository:

https://github.com/publisheddiman/nodewave-fullstack-frontend

Backend Repository:

https://github.com/publisheddiman/nodewave-fullstack-backend

# Technology Stack

## Core

-   Next.js 16 App Router
-   React 19
-   TypeScript Strict Mode
-   Tailwind CSS 4

## State Management

-   TanStack Query 5
-   Zustand 5

## Form and Validation

-   React Hook Form
-   Zod

## UI

-   Tailwind CSS
-   Radix UI / shadcn components

# Application Features

## Authentication

Implemented:

-   Login
-   Protected routes
-   JWT session handling
-   Role-based interface rendering

Supported accounts:

## Product Manager

Email:

pm@nodewave.local

## UI/UX Engineer

Email:

uiux@nodewave.local

## Frontend Engineer

Email:

frontend@nodewave.local

## Backend Engineer

Email:

backend@nodewave.local

## Client Guest

Email:

client@nodewave.local

Password:

Password123!

# User Interface Access

## PM Dashboard

Features:

-   View project overview
-   Manage tasks
-   View task dependencies
-   Monitor project progress

## Internal Team Dashboard

Features:

-   View assigned tasks
-   Update task status
-   Upload attachments

Restrictions:

-   Cannot modify task descriptions
-   Cannot access unrelated tasks

## Client Dashboard

Features:

-   View owned projects
-   View project metrics
-   View client-visible tasks

Hidden data:

-   Engineer identity
-   Department information
-   Internal comments

# Backend Integration

The frontend communicates with the Hono backend API through:

Environment variable:

    NEXT_PUBLIC_BE_URL

Example:

    NEXT_PUBLIC_BE_URL=https://nodewave-fullstack-backend-production.up.railway.app

# Project Structure

    src/
    |
    ├── app/
    |   ├── login/
    |   ├── dashboard/
    |
    ├── components/
    |
    ├── hooks/
    |
    ├── lib/
    |   ├── axios.ts
    |
    ├── stores/
    |
    └── services/

# Deployment

Platform:

Vercel

Deployment flow:

    GitHub Repository

            |

    Vercel Build

            |

    Production Deployment

            |

    Frontend Connected To Railway API

# Screenshots

Add screenshots:

1.  Login page
2.  PM Task Board
3.  Blocked dependency state
4.  Client dashboard

# Demo Flow

The demo covers:

1.  User authentication
2.  PM task management
3.  Dependency blocking behavior
4.  Client data isolation
5.  Role-based access control

# Development

Install dependencies:

    bun install

Run development server:

    bun dev

Build production:

    bun run build

Start production:

    bun start

# Assessment Submission

NodeWave Fullstack Engineer Assessment

Frontend:

https://github.com/publisheddiman/nodewave-fullstack-frontend

Backend:

https://github.com/publisheddiman/nodewave-fullstack-backend
