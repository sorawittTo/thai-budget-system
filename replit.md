# Budget Management System

## Overview

This is a full-stack budget management system built with React, TypeScript, Express, and Drizzle ORM. The application is designed for managing annual budgets with features for budget items, employee management, travel expenses, assistance payments, overtime calculations, and working day calculations. The system uses Thai language and follows Thai fiscal year conventions.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **API Design**: RESTful API with CRUD operations
- **File Upload**: Multer for handling file uploads
- **Session Management**: Express sessions with PostgreSQL store

## Key Components

### Database Schema
The application uses a well-structured PostgreSQL schema with the following main tables:
- `budget_items` - Annual budget line items with current/compare year amounts
- `employees` - Employee information with salary and allowance data
- `master_rates` - Reference rates for various calculations
- `travel_expenses` - Travel expense records by employee
- `assistance_payments` - Employee assistance payment records
- `overtime_payments` - Overtime payment calculations
- `working_days` - Working day calculations by year

### Core Modules
1. **Budget Module** - Manages annual budget items with year-over-year comparison
2. **Employee Module** - Handles employee data and master rates
3. **Travel Module** - Calculates travel expenses and allowances
4. **Assistance Module** - Manages assistance payments and overtime
5. **Workday Module** - Calculates working days and holidays

### UI Components
- Comprehensive shadcn/ui component library
- Responsive design with mobile-first approach
- Thai language support with Sarabun font
- Excel export functionality using SheetJS
- Local storage for data persistence

## Data Flow

1. **Client Requests**: React components make API calls through TanStack Query
2. **API Layer**: Express routes handle CRUD operations with validation
3. **Database Layer**: Drizzle ORM manages PostgreSQL interactions
4. **Response Flow**: Data flows back through the same layers with proper error handling

The application follows a typical client-server architecture with:
- Frontend state managed by TanStack Query for server data
- Local state for UI interactions
- Optimistic updates for better user experience
- Comprehensive error handling and loading states

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **UI**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **Excel**: SheetJS (xlsx) for spreadsheet functionality
- **Validation**: Zod for schema validation
- **State Management**: TanStack Query for server state

### Development Dependencies
- **Build**: Vite with React plugin
- **TypeScript**: Full TypeScript support across the stack
- **ESBuild**: For server-side bundling
- **Replit Integration**: Development environment optimizations

## Deployment Strategy

The application is configured for deployment on Replit with:
- **Development**: `npm run dev` - Runs both client and server in development mode
- **Build**: `npm run build` - Creates production builds for both client and server
- **Production**: `npm run start` - Runs the production server
- **Database**: `npm run db:push` - Pushes schema changes to PostgreSQL

The build process:
1. Vite builds the React client to `dist/public`
2. ESBuild bundles the Express server to `dist/index.js`
3. Static files are served from the Express server
4. Database migrations are handled through Drizzle Kit

## Changelog

- July 05, 2025. Initial setup with Thai budget management system
- July 05, 2025. Added original data from HTML file (24 budget items, 17 employees, master rates)
- July 05, 2025. Updated UI to match original design 100% with flat-input styling, proper table layout, and category grouping
- July 05, 2025. Updated travel module with 4 tabs, working add/edit/delete functions, and tooltip conditions
- July 05, 2025. Updated master rates table headers: "ค่าเดินทางสายงานนอกพื้นที่" → "ค่าซื้อของเหมาจ่าย", "ค่าเดินทางประชุมการปฏิบัติงาน/เดินทาง" → "ค่ารถโดยสาร โคราช-กทม./เที่ยว", "ค่าเดินทางนำนักเรียน" → "ค่ารถรับจ้าง/เที่ยว"
- July 05, 2025. Updated souvenir travel tab: removed vehicle cost column, added transport columns with multi-line headers and round-trip calculations (standard rate × 2)
- July 05, 2025. Updated family visit travel tab: changed "ค่ารถทัวร์เยี่ยมบ้าน" to "ค่ารถทัวร์ไป-กลับ", added "จำนวนครั้ง" column with calculations based on employee tour cost × 2 × trip count
- July 05, 2025. Updated company event travel tab: changed "ค่าพาหนะ" to "ค่ารถโดยสาร ไป-กลับ", added editable bus cost field with calculation = user input × 2 for round-trip costs
- July 05, 2025. Updated rotation work travel tab: redesigned to match souvenir tab layout with working days column (no age column), added transport columns with round-trip calculations, and other vehicle costs column
- July 05, 2025. Updated company event travel tab: added editable accommodation fields for customizable per-person costs, maintaining round-trip calculation logic for transport expenses
- July 05, 2025. Removed add/delete buttons from all travel tabs: simplified interface to only show edit functionality for existing data, maintaining clean table layouts

## User Preferences

Preferred communication style: Simple, everyday language.