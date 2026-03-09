# Car Rental Frontend - Customer Interface

This is the upgraded React frontend for the Car Rental Management System, featuring a modern customer-facing interface that matches the provided landing page design.

## New Features

### Customer-Facing Pages

- **Home Page** (`/`) - Hero section with search and featured cars
- **Cars Page** (`/cars`) - Full car listing with filters
- **Reservations Page** (`/reservations`) - Customer booking history
- **About Page** (`/about`) - Company information

### Components

- **Navbar** - Responsive navigation with mobile menu
- **Hero** - Landing section with search functionality
- **CarCard** - Reusable car display component
- **CarGrid** - Grid layout for car listings
- **FiltersSidebar** - Advanced filtering options
- **FeatureHighlights** - Service highlights section
- **ReservationModal** - Booking form modal

### Features

- Real-time filtering by category, price, and dates
- Responsive design (mobile, tablet, desktop)
- Modern UI with Tailwind CSS
- Integration with existing backend APIs
- Reservation management system

## Design System

### Colors

- Primary Blue: `#192336`
- Accent #d9b15c: `#d9b15c`
- Light Blue: `#004aad`
- Gray: `#6d6e71`

### Layout

- Desktop: 3-column car grid
- Tablet: 2-column car grid
- Mobile: 1-column car grid

## Routes

### Customer Routes

- `/` - Home page
- `/cars` - Car listings
- `/reservations` - Customer reservations
- `/about` - About page

### Admin Routes (unchanged)

- `/admin/login` - Admin login
- `/dashboard/*` - Admin dashboard

## API Integration

The frontend uses the existing backend APIs:

- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/available` - Get available vehicles
- `POST /api/reservations` - Create reservation
- `GET /api/reservations/customer` - Get customer reservations

## Context Management

- **FilterContext** - Manages car filtering state
- **AuthContext** - User authentication (existing)
- **ToastContext** - Notifications (existing)

## Installation

The project uses the existing dependencies:

- React 18
- React Router DOM
- Tailwind CSS
- Lucide React (icons)
- Axios (API calls)

No additional dependencies required.

## Usage

1. Start the backend server
2. Start the frontend: `npm run dev`
3. Visit `http://localhost:5173` for the customer interface
4. Visit `http://localhost:5173/dashboard` for admin interface

## Notes

- All existing backend APIs and database schema remain unchanged
- Admin functionality is preserved and accessible via `/dashboard`
- Customer interface is fully responsive and modern
- Reservation logic integrates with existing backend system
