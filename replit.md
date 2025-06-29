# Social Club Platform

## Overview
A comprehensive cannabis-themed social platform featuring an engaging member management system with advanced authentication and interactive user experiences. The platform has been updated to remove location-specific branding and focuses on premium cannabis experiences.

## Project Architecture
- React-based frontend with responsive design using Vite and TypeScript
- Express.js backend with PostgreSQL database
- Protected routing and secure authentication
- Dynamic user dashboards with donation functionality
- Modular component architecture with shadcn/ui components
- External chat integration capabilities via bizichat.ai

## Key Features
- Email-first authentication flow with onboarding questionnaire
- Welcome landing page with "Social Club" branding (Marbella references removed)
- Welcome message screen with cannabis disclaimers and policies
- Member area with catalogue-style product browsing and donation system
- Admin dashboard with member management and bouncer communication hub
- File upload capabilities during onboarding process

## Recent Changes
**January 29, 2025**
- Restored "Marbella Social Club" branding throughout the application
- Welcome landing page displays "Marbella" (large) and "Social Club" (smaller) for proper hierarchy
- Updated bouncer button functionality to scroll to embedded communication hub instead of external link
- Fixed admin authentication to redirect properly to dashboard

## User Preferences
- Preference for clean, minimalistic design with cannabis-themed aesthetics
- Focus on professional presentation while maintaining cannabis culture elements
- Emphasis on smooth user experience and proper navigation flows
- Request for embedded solutions over external redirects where possible

## Technical Stack
- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- Backend: Express.js, TypeScript
- Database: PostgreSQL with Drizzle ORM
- Authentication: Custom email-based system
- File Uploads: Multer middleware
- State Management: TanStack Query
- Routing: Wouter

## Admin Credentials
- Email: admin123@gmail.com
- Password: admin123
- Direct access to admin dashboard with member management tools

## External Integrations
- Bouncer communication hub: https://bizichat.ai/webchat/?p=1899468&ref=1748302315388
- Embedded iframe in admin dashboard for seamless communication