# cPanel Deployment Guide - Car Rental System

## 📋 Prerequisites

- cPanel account with Node.js support (v18+ recommended)
- MySQL database access
- Domain/subdomain configured
- SSH access (optional but recommended)

---

## 🗂️ Deployment Folder Structure

```
/home/username/
├── nodejsapp/                    # Backend application
│   ├── src/
│   ├── prisma/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── public_html/                  # Frontend (React build)
    ├── index.html
    ├── assets/
    └── ...
```

---

## 🔧 Part 1: Database Setup

### 1. Create MySQL Database in cPanel

1. Go to **cPanel → MySQL Databases**
2. Create new database: `username_carrental`
3. Create new user: `username_caruser`
4. Set strong password
5. Add user to database with ALL PRIVILEGES
6. Note down:
   - Database name: `username_carrental`
   - Username: `username_caruser`
   - Password: `your_password`
   - Host: `localhost`

### 2. Import Database Schema

**Option A: Using phpMyAdmin**
1. Go to **cPanel → phpMyAdmin**
2. Select your database
3. Click **SQL** tab
4. Run Prisma migration SQL or use Prisma push (see backend setup)

**Option B: Using SSH**
```bash
mysql -u username_caruser -p username_carrental < schema.sql
```

---

## 🚀 Part 2: Backend Deployment

### Step 1: Prepare Backend Files

**On your local machine:**

```bash
# Navigate to backend folder
cd car-rental/backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create production build (if needed)
# No build step needed for Node.js backend
```

### Step 2: Upload Backend to cPanel

**Upload via File Manager or FTP:**
- Upload entire `backend` folder to `/home/username/nodejsapp/`
- **DO NOT upload:** `node_modules/`, `.env` (create new one)

**Files to upload:**
```
nodejsapp/
├── src/
├── prisma/
├── scripts/
├── server.js
├── package.json
├── package-lock.json
└── .gitignore
```

### Step 3: Configure Backend Environment

Create `.env` file in `/home/username/nodejsapp/.env`:

```env
NODE_ENV=production
PORT=3000

DATABASE_URL="mysql://username_caruser:your_password@localhost:3306/username_carrental"

JWT_SECRET="your-super-secret-jwt-key-min-32-chars-change-this"
JWT_EXPIRES_IN="7d"

FRONTEND_URL="https://yourdomain.com,https://www.yourdomain.com"

CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="Car Rental <your-email@gmail.com>"
```

### Step 4: Setup Node.js Application in cPanel

1. Go to **cPanel → Setup Node.js App**
2. Click **Create Application**
3. Configure:
   - **Node.js version:** 18.x or higher
   - **Application mode:** Production
   - **Application root:** `nodejsapp`
   - **Application URL:** Choose your domain/subdomain
   - **Application startup file:** `server.js`
   - **Environment variables:** (Add from .env if UI available)

4. Click **Create**

### Step 5: Install Dependencies via SSH

```bash
# SSH into your server
ssh username@yourdomain.com

# Navigate to app directory
cd nodejsapp

# Load Node.js environment (cPanel specific)
source /home/username/nodevenv/nodejsapp/18/bin/activate

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push

# Optional: Seed database
node prisma/seed.js

# Deactivate virtual environment
deactivate
```

### Step 6: Start Application

In cPanel Node.js App Manager:
- Click **Start App** or **Restart App**
- Check status shows "Running"
- Note the application URL

### Step 7: Setup Reverse Proxy (if needed)

If you want API at `yourdomain.com/api`:

Create `.htaccess` in `/home/username/public_html/`:

```apache
# Proxy API requests to Node.js app
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
```

---

## 🎨 Part 3: Frontend Deployment

### Step 1: Configure Production API URL

Edit `frontend/.env.production`:

```env
# Leave empty for same-domain deployment
VITE_API_URL=

# OR specify full URL if backend is on different domain
# VITE_API_URL=https://api.yourdomain.com
```

### Step 2: Build React Application

**On your local machine:**

```bash
# Navigate to frontend folder
cd car-rental/frontend

# Install dependencies
npm install

# Build for production
npm run build
```

This creates `dist/` folder with optimized production files.

### Step 3: Upload Frontend to cPanel

**Upload via File Manager or FTP:**

1. Go to `/home/username/public_html/`
2. **Delete default files** (index.html, etc.)
3. Upload **contents** of `dist/` folder (not the folder itself)

**Final structure:**
```
public_html/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── .htaccess (create this)
```

### Step 4: Configure React Router

Create `.htaccess` in `/home/username/public_html/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Proxy API requests to Node.js backend
  RewriteCond %{REQUEST_URI} ^/api/
  RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
  
  # React Router - redirect all requests to index.html
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} !^/api/
  RewriteRule . /index.html [L]
</IfModule>
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] MySQL database created in cPanel
- [ ] Database user created with privileges
- [ ] Domain/subdomain configured
- [ ] SSL certificate installed (Let's Encrypt via cPanel)

### Backend Deployment
- [ ] Backend files uploaded to `nodejsapp/`
- [ ] `.env` file created with production values
- [ ] Node.js app created in cPanel
- [ ] Dependencies installed via SSH
- [ ] Prisma client generated
- [ ] Database schema pushed
- [ ] Application started and running
- [ ] Test API endpoint: `https://yourdomain.com/api`

### Frontend Deployment
- [ ] Production build created (`npm run build`)
- [ ] Build files uploaded to `public_html/`
- [ ] `.htaccess` configured for React Router
- [ ] API proxy configured in `.htaccess`
- [ ] Test frontend: `https://yourdomain.com`
- [ ] Test login functionality
- [ ] Test API calls from frontend

### Post-Deployment
- [ ] All features working correctly
- [ ] Images uploading to Cloudinary
- [ ] Email notifications working
- [ ] PDF generation working
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Monitor error logs in cPanel

---

## 🔍 Testing Endpoints

### Test Backend API
```bash
# Health check
curl https://yourdomain.com/api

# Test auth (should return 401)
curl https://yourdomain.com/api/vehicles
```

### Test Frontend
1. Open `https://yourdomain.com`
2. Try to login
3. Check browser console for errors
4. Test vehicle listing
5. Test creating reservation

---

## 📝 Terminal Commands Summary

### Backend Setup (via SSH)
```bash
# Connect to server
ssh username@yourdomain.com

# Navigate to app
cd nodejsapp

# Activate Node.js environment
source /home/username/nodevenv/nodejsapp/18/bin/activate

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Optional: Seed data
node prisma/seed.js

# Exit
deactivate
exit
```

### Frontend Build (Local Machine)
```bash
# Navigate to frontend
cd car-rental/frontend

# Install dependencies
npm install

# Build production
npm run build

# Upload dist/ contents to public_html/
```

---

## 🐛 Troubleshooting

### Backend Issues

**App won't start:**
- Check Node.js version (18+)
- Verify `server.js` path in cPanel
- Check error logs in cPanel Node.js App Manager
- Verify `.env` file exists and has correct values

**Database connection error:**
- Verify DATABASE_URL format
- Check MySQL user has privileges
- Test database connection in phpMyAdmin
- Ensure Prisma client is generated

**500 Internal Server Error:**
- Check application logs in cPanel
- Verify all environment variables set
- Run `npx prisma generate` again
- Restart Node.js application

### Frontend Issues

**Blank page:**
- Check browser console for errors
- Verify `.htaccess` exists
- Check file permissions (644 for files, 755 for folders)
- Clear browser cache

**API calls failing:**
- Check `.htaccess` proxy configuration
- Verify backend is running
- Check CORS settings in backend
- Test API directly: `https://yourdomain.com/api`

**404 on page refresh:**
- Verify `.htaccess` React Router rules
- Check mod_rewrite is enabled

---

## 🔄 Updating Application

### Update Backend
```bash
# SSH into server
ssh username@yourdomain.com
cd nodejsapp

# Backup current version
cp -r . ../nodejsapp_backup

# Upload new files via FTP/File Manager
# Then:
source /home/username/nodevenv/nodejsapp/18/bin/activate
npm install
npx prisma generate
npx prisma db push

# Restart app in cPanel Node.js Manager
```

### Update Frontend
```bash
# Local machine
cd car-rental/frontend
npm run build

# Upload dist/ contents to public_html/
# Clear browser cache
```

---

## 📞 Support Resources

- **cPanel Documentation:** https://docs.cpanel.net/
- **Prisma Docs:** https://www.prisma.io/docs
- **Node.js on cPanel:** Check your hosting provider's documentation

---

## 🔐 Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong JWT_SECRET** (min 32 characters)
3. **Enable SSL/HTTPS** (free Let's Encrypt in cPanel)
4. **Set secure database password**
5. **Use Gmail App Password** for email (not regular password)
6. **Keep dependencies updated:** `npm audit fix`
7. **Set proper file permissions:**
   - Files: 644
   - Folders: 755
   - .env: 600

---

## 📊 Performance Optimization

1. **Enable Gzip compression** (already in code via compression middleware)
2. **Use Cloudinary** for image optimization
3. **Enable caching** in `.htaccess`:

```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

**Deployment Complete! 🎉**

Your Car Rental System should now be live at `https://yourdomain.com`
