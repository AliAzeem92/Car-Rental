# Car Rental System - Production Deployment

## 🚀 Quick Start

This project is ready for deployment on cPanel with Node.js support.

### 📁 Project Structure
```
car-rental/
├── backend/          # Node.js + Express + Prisma
├── frontend/         # React + Vite
└── docs/            # Deployment guides
```

---

## 📚 Documentation Files

1. **DEPLOYMENT_GUIDE.md** - Complete step-by-step deployment guide
2. **DEPLOYMENT_CHECKLIST.md** - Checklist for deployment verification
3. **QUICK_DEPLOY.md** - Quick reference commands

---

## ⚡ Quick Deployment Steps

### 1. Backend (Node.js)
```bash
cd backend
npm install
npx prisma generate
# Upload to: /home/username/nodejsapp/
```

### 2. Frontend (React)
```bash
cd frontend
npm install
npm run build
# Upload dist/ contents to: /home/username/public_html/
```

### 3. Configure cPanel
- Create Node.js app pointing to `nodejsapp/server.js`
- Create MySQL database
- Add `.env` file with production credentials
- Install dependencies via SSH
- Start the application

---

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://user:pass@localhost:3306/dbname
JWT_SECRET=your-secret-key
FRONTEND_URL=https://yourdomain.com
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend (.env.production)
```env
VITE_API_URL=
```

---

## 📦 What to Upload

### Backend to `/home/username/nodejsapp/`
- ✅ src/
- ✅ prisma/
- ✅ server.js
- ✅ package.json
- ✅ .env (create new)
- ❌ node_modules/
- ❌ .git/

### Frontend to `/home/username/public_html/`
- ✅ Contents of dist/ folder
- ✅ .htaccess (from template)
- ❌ src/
- ❌ node_modules/

---

## 🧪 Testing

### Backend API
```bash
curl https://yourdomain.com/api
```

### Frontend
Open browser: `https://yourdomain.com`

---

## 📞 Support

For detailed instructions, see **DEPLOYMENT_GUIDE.md**

---

## 🔐 Security Notes

- Use strong passwords
- Enable SSL/HTTPS
- Keep dependencies updated
- Never commit .env files
- Use Gmail App Password for email

---

## 📊 Tech Stack

- **Backend:** Node.js, Express, Prisma, MySQL
- **Frontend:** React, Vite, TailwindCSS
- **Hosting:** cPanel with Node.js support
- **Database:** MySQL
- **Storage:** Cloudinary
- **Email:** Gmail SMTP

---

**Version:** 1.0.0
**Last Updated:** 2024
