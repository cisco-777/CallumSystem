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

## Recent Changes
**July 23, 2025 - Fixed Critical Pricing Logic**
- Updated ALL orders to use pickup code pricing logic (last 2 digits of pickup code = total price)
- Fixed product names in orders to show actual product names instead of strain types
- Applied pickup code pricing to all existing orders: 4721→€21, 8394→€94, 5619→€19, 2847→€47, 7352→€52, 9164→€64, 3758→€58, 3234→€34
- Updated donation route to automatically calculate future order prices using pickup code logic
- Ensured pricing only visible to admin, never to members/users
- Fixed Order Control Center to display proper product names and calculated prices

**July 23, 2025 - Dropdown Category Filter System**
- Replaced long scrolling sections with compact dropdown menu system
- Added category dropdown with options: All Products, Sativa, Indica, Hybrid, Hash, Cannabis
- Fixed hash product categorization logic:
  * Hash Sativa products appear in both Hash and Sativa filters
  * Hash Indica products appear in both Hash and Indica filters
  * Cannabis filter shows all flower products (no hash)
  * Hash filter shows all hash products regardless of strain type
- Improved page layout - no more endless scrolling through categories
- Responsive dropdown design matches existing UI styling
- Default view shows "All Products" on page load
- Maintained all existing functionality (add to cart, quantity selectors, product details)

**July 23, 2025 - Database Integration Complete**
- Successfully integrated PostgreSQL database using Neon
- Migrated from in-memory storage to persistent database storage
- All existing database schema pushed to production database
- Database connectivity verified and operational
- DatabaseStorage class already implemented with full CRUD operations

**July 23, 2025 - Admin Dashboard Enhancement**
- Removed fail safe functionality completely from admin dashboard  
- Added comprehensive Customer Preferences Analytics section with strain and product type breakdowns
- Implemented Customer Search Tool with detailed customer profiles and order history
- Updated demo member account from "demo member" to "John Doe" in database
- Connected John Doe's order data to admin analytics calculations
- Added backend API endpoint for user management (/api/users with admin authentication)
- Enhanced analytics to use real customer order data for preference calculations

**Earlier Updates**
- Updated branding from "La Cultura Social Club" to "The Bud House Social Club" (July 23, 2025)
- Changed location reference from "Barcelona's chillest stop" to "Benalmadena's chillest spot"
- Updated background image from Barcelona to Benalmadena port across all landing pages
- Updated CSS theme color variable names from "lc-" prefix to "tbh-" prefix

## Key Features
- Email-first authentication flow with onboarding questionnaire
- Welcome landing page with "The Bud House Social Club" branding
- Welcome message screen with cannabis disclaimers and policies
- Member area with catalogue-style product browsing and donation system
- Admin dashboard with member management and bouncer communication hub
- File upload capabilities during onboarding process

## Recent Changes
**July 22, 2025**
- Updated all branding from "GreenMoon" to "La Cultura" throughout the application (later updated to "The Bud House")
- Changed tagline from "GreenMoon's chillest stop" to "Barcelona's chillest stop" (later updated to "Benalmadena's chillest spot")
- Updated CSS theme color variable names from --gmc- to --lc- prefix (later updated to --tbh- prefix)
- Maintained consistent brand identity across all pages and components

**July 20, 2025**
- Enhanced admin dashboard with comprehensive analytics pulling from real Dispensary Stock data
- Added four new analytics sections:
  * Inventory Overview: Total stock value, stock status, average stock per product, potential revenue
  * Low Stock Alerts: Products under 120g with color-coded warnings (red <100g, orange <120g)
  * Product Performance: Most profitable product display, strain type breakdown percentages
  * Revenue Analytics: Potential revenue, average order value, stock turnover rate calculations
- Analytics automatically update when orders are confirmed and stock reduces
- Calculations use real data from existing Dispensary Stock section (stock quantities × admin prices)
- Color-coded alerts and professional styling for easy interpretation
- Created highly visible member dashboard that appears when demo@member.com logs in
- Enhanced member dashboard with timeline layout fixes and professional catalogue transition
- Fixed donation history timeline with visual timeline line and organized monthly sections
- Removed ugly dashed border and created elegant catalogue transition with gradient separator

**July 19, 2025**
- Added 2 new hash products: "Moroccan Hash" (Indica) and "Dry-Shift Hash" (Sativa)
- Generated 6-digit product codes for all products ending in 12, 10, 13, or 15
- Added quantity selector (1-5 grams) for each product in catalogue
- Updated donation flow with 4-digit pickup code generation
- Created comprehensive orders database table with all order details
- Replaced "Bouncer" with "Order Control" throughout admin interface
- Renamed "Bouncer Communication Hub" to "Order Control Center"
- Created order management interface that reads from orders database
- Added cancel and confirm/complete buttons for order management
- Implemented real-time order tracking and status updates
- Renamed "Product Inventory" to "Dispensary Stock"
- Added stock quantity display (e.g., "Zkittlez: 200g available")
- Added admin price view for each product
- Implemented automatic stock reduction when admin confirms orders
- Created FAILSAFE button with visual simulation (60-second auto-restore)

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

## Demo Member Credentials
- Email: demo@member.com
- Password: demo123
- Access to personalized member dashboard with donation history and analytics

## Database Schema
- Users table: authentication and onboarding data
- Products table: catalogue items with product codes
- Orders table: pickup codes, items, quantities, total prices, timestamps, status
- Basket items table: temporary user selections
- Donations table: completed donation records

## Order Management System
- Random 4-digit pickup code generation for each order
- Complete order tracking with timestamps and status management
- Admin Order Control Center displays all orders in real-time
- Cancel and complete order functionality
- User receives pickup code message upon donation completion