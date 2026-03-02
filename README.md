# 🚗 Car Rental Management System

A full-stack car rental management system with admin dashboard, built with React, Node.js, Express, MySQL, and Prisma ORM.

## 📋 Features

### Backend
- ✅ RESTful API with Express.js
- ✅ MySQL database with Prisma ORM
- ✅ JWT authentication (HttpOnly cookies)
- ✅ File uploads with Multer + Cloudinary
- ✅ Automatic PDF contract generation
- ✅ MVC architecture
- ✅ Relational database design
- ✅ Business logic validation

### Frontend
- ✅ React.js with Vite
- ✅ TailwindCSS styling
- ✅ Context API state management
- ✅ React Router navigation
- ✅ Axios API integration
- ✅ Responsive admin dashboard

### System Features
- 🚗 Vehicle management (CRUD)
- 📅 Reservation system with date validation
- 👥 Customer management with blacklist
- 🗓️ Planning calendar view
- 🔧 Maintenance alerts
- 📄 Automatic contract PDF generation
- 🚫 Double booking prevention
- ⚠️ License expiration warnings
- 📊 Dashboard statistics

## 🛠️ Tech Stack

**Backend:**
- Node.js
- Express.js
- MySQL
- Prisma ORM
- JWT
- Multer
- Cloudinary
- PDFKit
- bcryptjs

**Frontend:**
- React.js (Vite)
- TailwindCSS
- React Router
- Axios
- Context API

## 📁 Project Structure

```
car-rental/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js
│   │   │   └── prisma.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── vehicleController.js
│   │   │   ├── customerController.js
│   │   │   ├── reservationController.js
│   │   │   └── planningController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── vehicleRoutes.js
│   │   │   ├── customerRoutes.js
│   │   │   ├── reservationRoutes.js
│   │   │   └── planningRoutes.js
│   │   ├── utils/
│   │   │   ├── cloudinary.js
│   │   │   └── pdfGenerator.js
│   │   └── app.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── layouts/
    │   │   └── DashboardLayout.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Vehicles.jsx
    │   │   ├── Reservations.jsx
    │   │   ├── Planning.jsx
    │   │   ├── Customers.jsx
    │   │   └── Maintenance.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- Cloudinary account (for image storage)

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create .env file:**
```bash
cp .env.example .env
```

4. **Configure .env file:**
```env
DATABASE_URL="mysql://username:password@localhost:3306/car_rental"
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"
PORT=5000

CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

5. **Create MySQL database:**
```sql
CREATE DATABASE car_rental;
```

6. **Run Prisma migrations:**
```bash
npx prisma migrate dev --name init
```

7. **Generate Prisma client:**
```bash
npx prisma generate
```

8. **Seed database with sample data:**
```bash
npm run prisma:seed
```

9. **Start backend server:**
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔑 Default Admin Credentials

After seeding the database:
- **Email:** admin@carrental.com
- **Password:** admin123

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/check` - Check authentication status

### Vehicles
- `GET /api/vehicles` - Get all vehicles (with filters)
- `GET /api/vehicles/:id` - Get single vehicle
- `POST /api/vehicles` - Create vehicle (with images)
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle
- `GET /api/vehicles/:id/history` - Get vehicle rental history

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer (with ID/license uploads)
- `PUT /api/customers/:id` - Update customer
- `PUT /api/customers/:id/blacklist` - Toggle blacklist status

### Reservations
- `GET /api/reservations` - Get all reservations (with filters)
- `POST /api/reservations` - Create reservation
- `PUT /api/reservations/:id/status` - Update reservation status
- `POST /api/reservations/:id/checkin` - Check-in reservation
- `POST /api/reservations/:id/checkout` - Check-out reservation

### Planning
- `GET /api/planning/calendar` - Get calendar data
- `GET /api/planning/maintenance` - Get maintenance alerts

## 🗄️ Database Schema

### Models
- **Admin** - System administrators
- **Vehicle** - Car inventory
- **VehicleImage** - Vehicle photos
- **Customer** - Rental customers
- **Reservation** - Rental bookings
- **CheckIn** - Rental start records
- **CheckOut** - Rental end records
- **Maintenance** - Vehicle maintenance schedule

### Enums
- **VehicleStatus:** AVAILABLE, RESERVED, RENTED, MAINTENANCE
- **ReservationStatus:** PENDING, CONFIRMED, ONGOING, COMPLETED, CANCELLED
- **MaintenanceType:** INSURANCE, OIL_CHANGE, SERVICE

## 🎯 Business Logic

1. **No Double Booking:** System validates date availability before creating reservations
2. **Automatic Status Updates:** Vehicle status changes based on reservation state
3. **Contract Generation:** PDF contracts auto-generate when reservation is confirmed
4. **Blacklist Validation:** Blacklisted customers cannot create reservations
5. **License Validation:** Expired licenses prevent new reservations
6. **Mileage Tracking:** Vehicle mileage updates automatically on checkout
7. **Maintenance Alerts:** System tracks upcoming maintenance due dates

## 🚀 Deployment

### Backend (cPanel/VPS)

1. **Build for production:**
```bash
npm install --production
```

2. **Set environment variables in production**

3. **Run migrations:**
```bash
npx prisma migrate deploy
```

4. **Start with PM2:**
```bash
pm2 start server.js --name car-rental-api
```

### Frontend (cPanel/Netlify/Vercel)

1. **Build for production:**
```bash
npm run build
```

2. **Upload `dist` folder to hosting**

3. **Configure environment variables**

## 📝 Usage Guide

### Adding a Vehicle
1. Navigate to Vehicles page
2. Click "+ Add Vehicle"
3. Fill in vehicle details
4. Upload vehicle images
5. Submit form

### Creating a Reservation
1. Navigate to Reservations page
2. Click "+ New Reservation"
3. Select vehicle and customer
4. Choose dates
5. Enter pricing details
6. Submit (system validates availability)

### Managing Customers
1. Navigate to Customers page
2. Add new customers with license info
3. Upload ID and license documents
4. Monitor license expiration dates
5. Blacklist problematic customers if needed

### Viewing Calendar
1. Navigate to Planning page
2. View monthly calendar with bookings
3. Navigate between months
4. See active reservations list

### Maintenance Alerts
1. Navigate to Maintenance page
2. View upcoming maintenance tasks
3. Color-coded by urgency
4. Track overdue items

## 🔒 Security Features

- JWT authentication with HttpOnly cookies
- Password hashing with bcryptjs
- Protected API routes
- Input validation
- SQL injection prevention (Prisma)
- XSS protection
- CORS configuration

## 🐛 Troubleshooting

**Database connection error:**
- Check MySQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

**Cloudinary upload fails:**
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper file types

**Frontend can't connect to backend:**
- Check backend is running on port 5000
- Verify CORS settings
- Check proxy configuration in vite.config.js

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 👨‍💻 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for efficient car rental management**
