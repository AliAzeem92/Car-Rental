# 🚗 Car Rental Management System

A full-stack car rental management system with customer and admin panels, built with React, Node.js, Express, Prisma, and MySQL.

## 🌟 Features

### Customer Features
- 🔍 Browse available vehicles with filters
- 📅 Make reservations with date selection
- 👤 User profile management
- 📱 Responsive design
- 🌐 Multi-language support (English & French)
- 📋 View reservation history
- ❌ Cancel reservations

### Admin Features
- 📊 Dashboard with analytics
- 🚙 Vehicle management (CRUD)
- 👥 Customer management
- 📅 Reservation management
- 🔧 Maintenance tracking
- 📄 Contract generation (PDF)
- ✅ Check-in/Check-out system
- 📧 Email notifications

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **i18n**: react-i18next

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: MySQL
- **Authentication**: JWT
- **File Upload**: Multer + Cloudinary
- **PDF Generation**: PDFKit
- **Email**: Nodemailer

## 📁 Project Structure

```
car-rental/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── context/
│   │   ├── services/
│   │   ├── locales/
│   │   └── App.jsx
│   ├── public/
│   └── package.json
└── README.md
```

## 🚀 Deployment

This project is configured for deployment on:
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Railway MySQL

### Quick Deploy

See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for a fast deployment checklist.

### Detailed Instructions

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for comprehensive deployment instructions.

## 💻 Local Development

### Prerequisites
- Node.js 18+ 
- MySQL 8+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
DATABASE_URL="mysql://username:password@localhost:3306/car_rental"
JWT_SECRET="your-secret-key"
PORT=5000
```

5. Run Prisma migrations:
```bash
npx prisma migrate dev
```

6. Seed the database (optional):
```bash
npm run prisma:seed
```

7. Start the server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env`:
```env
VITE_API_URL=http://localhost:5000
```

5. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔑 Demo Credentials

### Admin Account
- Email: `admin@carrental.com`
- Password: `admin123`

### Customer Account
- Email: `customer@example.com`
- Password: `customer123`

## 📦 Database Schema

The application uses the following main models:
- **User**: Customer and admin accounts
- **Vehicle**: Car inventory
- **Reservation**: Booking records
- **Checkout/Checkin**: Rental process tracking
- **Maintenance**: Vehicle maintenance scheduling
- **InvoiceSettings**: Company information for contracts

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL=mysql://...
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Optional
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get vehicle by ID
- `POST /api/vehicles` - Create vehicle (Admin)
- `PUT /api/vehicles/:id` - Update vehicle (Admin)
- `DELETE /api/vehicles/:id` - Delete vehicle (Admin)

### Reservations
- `GET /api/reservations` - Get user reservations
- `POST /api/reservations` - Create reservation
- `PUT /api/reservations/:id` - Update reservation
- `DELETE /api/reservations/:id` - Cancel reservation

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/customers` - Get all customers
- `GET /api/admin/reservations` - Get all reservations

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📞 Support

For support, email support@carrental.com or open an issue.

---

## 🎯 Roadmap

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-location support
- [ ] Insurance management
- [ ] Customer reviews and ratings
- [ ] Loyalty program

---

Made with ❤️ by Your Team
