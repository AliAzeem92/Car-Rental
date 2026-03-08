# Production Deployment Checklist

## 📋 Pre-Deployment

### cPanel Setup
- [ ] cPanel account with Node.js support (v18+)
- [ ] Domain/subdomain configured and pointing to server
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] SSH access enabled (optional but recommended)

### Database Setup
- [ ] MySQL database created: `username_carrental`
- [ ] MySQL user created: `username_caruser`
- [ ] User added to database with ALL PRIVILEGES
- [ ] Database credentials noted down

### Local Preparation
- [ ] All code committed to version control
- [ ] Tested locally and working
- [ ] Environment variables documented
- [ ] Cloudinary account setup
- [ ] Gmail app password generated

---

## 🔧 Backend Deployment

### File Upload
- [ ] Backend files uploaded to `/home/username/nodejsapp/`
- [ ] Excluded: `node_modules/`, `.env`, `.git/`
- [ ] Included: `src/`, `prisma/`, `server.js`, `package.json`

### Environment Configuration
- [ ] `.env` file created in `nodejsapp/`
- [ ] `NODE_ENV=production` set
- [ ] `PORT` configured (usually 3000)
- [ ] `DATABASE_URL` with correct cPanel MySQL credentials
- [ ] `JWT_SECRET` set (min 32 characters)
- [ ] `FRONTEND_URL` set to your domain(s)
- [ ] Cloudinary credentials configured
- [ ] Email credentials configured

### cPanel Node.js App
- [ ] Node.js app created in cPanel
- [ ] Application root: `nodejsapp`
- [ ] Startup file: `server.js`
- [ ] Mode: Production
- [ ] Node.js version: 18.x or higher

### SSH Setup
- [ ] Connected via SSH
- [ ] Navigated to `nodejsapp/`
- [ ] Activated Node.js environment
- [ ] Ran `npm install`
- [ ] Ran `npx prisma generate`
- [ ] Ran `npx prisma db push`
- [ ] Ran `node prisma/seed.js` (optional)
- [ ] Deactivated environment

### Backend Testing
- [ ] App started in cPanel Node.js Manager
- [ ] Status shows "Running"
- [ ] Tested: `curl https://yourdomain.com/api`
- [ ] Returns JSON response
- [ ] No errors in cPanel logs

---

## 🎨 Frontend Deployment

### Build Process
- [ ] Navigated to `frontend/` folder
- [ ] Ran `npm install`
- [ ] Created `.env.production` (VITE_API_URL empty)
- [ ] Ran `npm run build`
- [ ] `dist/` folder created successfully

### File Upload
- [ ] Navigated to `/home/username/public_html/`
- [ ] Deleted default cPanel files
- [ ] Uploaded **contents** of `dist/` folder
- [ ] Files include: `index.html`, `assets/`, etc.

### Configuration
- [ ] Created `.htaccess` in `public_html/`
- [ ] API proxy configured (port 3000 or your port)
- [ ] React Router rules added
- [ ] Security headers added
- [ ] Caching rules added

### Frontend Testing
- [ ] Opened `https://yourdomain.com`
- [ ] Page loads without errors
- [ ] No console errors in browser
- [ ] React Router working (refresh on any page)
- [ ] API calls working

---

## ✅ Functionality Testing

### Authentication
- [ ] Login page loads
- [ ] Can login with admin credentials
- [ ] JWT token stored correctly
- [ ] Logout works
- [ ] Protected routes redirect to login

### Vehicles
- [ ] Vehicle list loads
- [ ] Can create new vehicle
- [ ] Images upload to Cloudinary
- [ ] Can edit vehicle
- [ ] Can view vehicle details
- [ ] Vehicle history loads

### Customers
- [ ] Customer list loads
- [ ] Can create new customer
- [ ] Can upload ID/license documents
- [ ] Can edit customer
- [ ] Blacklist toggle works

### Reservations
- [ ] Reservation list loads
- [ ] Can create new reservation
- [ ] PDF contract generates
- [ ] Status updates work
- [ ] Payment status updates work
- [ ] Email notifications sent

### Maintenance
- [ ] Maintenance alerts show
- [ ] Can update maintenance schedules
- [ ] Alerts trigger correctly
- [ ] Can mark maintenance complete

### Check-in/Check-out
- [ ] Can check out vehicle
- [ ] Can check in vehicle
- [ ] Mileage updates correctly
- [ ] Extra charges calculated

### Planning
- [ ] Calendar view loads
- [ ] Shows reservations correctly
- [ ] Maintenance alerts visible

---

## 🔐 Security Verification

- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS configured correctly
- [ ] JWT secret is strong and unique
- [ ] Database password is strong
- [ ] `.env` file permissions: 600
- [ ] No sensitive data in client-side code
- [ ] Helmet middleware active
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection headers set

---

## 📊 Performance Checks

- [ ] Gzip compression enabled
- [ ] Browser caching configured
- [ ] Images optimized via Cloudinary
- [ ] No console errors
- [ ] Page load time acceptable
- [ ] Mobile responsive
- [ ] Works on different browsers

---

## 📝 Documentation

- [ ] `.env.production` template created
- [ ] Deployment guide documented
- [ ] Database credentials saved securely
- [ ] API endpoints documented
- [ ] Admin credentials saved securely

---

## 🔄 Post-Deployment

- [ ] Monitor error logs for 24 hours
- [ ] Test all features thoroughly
- [ ] Get user feedback
- [ ] Set up backup schedule
- [ ] Document update procedure
- [ ] Create rollback plan

---

## 🐛 Common Issues Checklist

### If backend won't start:
- [ ] Check Node.js version
- [ ] Verify `server.js` path
- [ ] Check `.env` file exists
- [ ] Review cPanel error logs
- [ ] Verify database connection

### If frontend is blank:
- [ ] Check browser console
- [ ] Verify `.htaccess` exists
- [ ] Clear browser cache
- [ ] Check file permissions
- [ ] Test API endpoint directly

### If API calls fail:
- [ ] Check `.htaccess` proxy
- [ ] Verify backend is running
- [ ] Check CORS settings
- [ ] Test API: `curl https://yourdomain.com/api`
- [ ] Review network tab in browser

### If database errors:
- [ ] Verify DATABASE_URL format
- [ ] Check MySQL user privileges
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push`
- [ ] Test connection in phpMyAdmin

---

## 📞 Emergency Contacts

- Hosting Provider Support: _______________
- Domain Registrar: _______________
- Database Admin: _______________
- Developer: _______________

---

## 🎉 Deployment Complete!

Once all items are checked, your Car Rental System is live!

**Live URL:** https://yourdomain.com
**API URL:** https://yourdomain.com/api
**Admin Panel:** https://yourdomain.com/admin

---

**Last Updated:** [Date]
**Deployed By:** [Name]
**Version:** 1.0.0
