# 🚀 Car Rental Deployment Guide

This guide will help you deploy your Car Rental application to Vercel (Frontend) and Railway (Backend + Database).

---

## 📋 Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Railway account (sign up at https://railway.app)
- Git installed locally

---

## 🗄️ Part 1: Deploy Database on Railway

### Step 1: Create MySQL Database

1. Go to [Railway](https://railway.app) and login
2. Click **"New Project"**
3. Select **"Provision MySQL"**
4. Wait for the database to be created
5. Click on the MySQL service
6. Go to **"Variables"** tab
7. Copy the following variables (you'll need them later):
   - `MYSQL_URL` or `DATABASE_URL`
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

### Step 2: Note Your Database Connection String

The connection string format should be:
```
mysql://USER:PASSWORD@HOST:PORT/DATABASE
```

Example:
```
mysql://root:password123@containers-us-west-123.railway.app:7890/railway
```

---

## 🔧 Part 2: Deploy Backend on Railway

### Step 1: Push Your Code to GitHub

```bash
cd d:\Work\Client\car-rental
git init
git add .
git commit -m "Initial commit for deployment"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy Backend to Railway

1. Go to [Railway](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `car-rental` repository
5. Railway will detect your backend automatically
6. Click on the deployed service

### Step 3: Configure Backend Environment Variables

1. Click on your backend service
2. Go to **"Variables"** tab
3. Click **"Raw Editor"** and add the following:

```env
DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Car Rental <your-email@gmail.com>

# Frontend URL (will update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app
```

**Important Notes:**
- Replace `DATABASE_URL` with the connection string from Part 1
- Generate a strong random string for `JWT_SECRET`
- Update `FRONTEND_URL` after deploying frontend (Part 3)

### Step 4: Configure Root Directory

1. In Railway service settings
2. Go to **"Settings"** tab
3. Find **"Root Directory"**
4. Set it to: `backend`
5. Click **"Save"**

### Step 5: Run Database Migrations

1. In Railway, click on your backend service
2. Go to **"Settings"** tab
3. Scroll to **"Deploy"** section
4. Add a **"Build Command"**:
   ```
   npm ci && npx prisma generate && npx prisma migrate deploy
   ```
5. Or run migrations manually using Railway CLI:
   ```bash
   railway login
   railway link
   cd backend
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Step 6: Get Backend URL

1. Go to **"Settings"** tab
2. Scroll to **"Networking"**
3. Click **"Generate Domain"**
4. Copy your backend URL (e.g., `https://your-backend.up.railway.app`)

---

## 🎨 Part 3: Deploy Frontend on Vercel

### Step 1: Update Frontend Environment Variable

Before deploying, you need to know your backend URL from Part 2, Step 6.

### Step 2: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and login
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will detect it's a Vite project
5. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variables

1. In Vercel project settings
2. Go to **"Settings"** → **"Environment Variables"**
3. Add the following:

```
VITE_API_URL=https://your-backend.up.railway.app
```

Replace with your actual Railway backend URL from Part 2, Step 6.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete
3. Copy your Vercel URL (e.g., `https://your-app.vercel.app`)

### Step 5: Update Backend CORS Settings

1. Go back to Railway
2. Open your backend service
3. Go to **"Variables"** tab
4. Update `FRONTEND_URL` with your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. The backend will automatically redeploy

---

## ✅ Part 4: Verify Deployment

### Test Your Application

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try to:
   - View available vehicles
   - Register a new account
   - Login with demo credentials
   - Create a reservation
   - View profile

### Check Backend Health

Visit: `https://your-backend.up.railway.app/api/health`

You should see a success response.

---

## 🔐 Part 5: Seed Database (Optional)

If you want to add demo data:

### Option 1: Using Railway CLI

```bash
railway login
railway link
cd backend
npx prisma db seed
```

### Option 2: Manual SQL

1. Go to Railway MySQL service
2. Click **"Data"** tab
3. Run your seed SQL queries manually

---

## 🛠️ Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- Check Railway logs: Service → **"Deployments"** → Click latest deployment → **"View Logs"**
- Verify `DATABASE_URL` is correct
- Ensure Prisma migrations ran successfully

**Problem**: Database connection error
- Verify MySQL service is running
- Check `DATABASE_URL` format
- Ensure database exists

**Problem**: CORS errors
- Verify `FRONTEND_URL` in Railway matches your Vercel URL
- Check backend CORS configuration in `src/app.js`

### Frontend Issues

**Problem**: API calls failing
- Verify `VITE_API_URL` in Vercel environment variables
- Check browser console for errors
- Ensure backend is running

**Problem**: Build fails
- Check Vercel build logs
- Verify all dependencies are in `package.json`
- Ensure `Root Directory` is set to `frontend`

### Database Issues

**Problem**: Tables don't exist
- Run migrations: `npx prisma migrate deploy`
- Check Railway MySQL logs

**Problem**: Need to reset database
```bash
railway login
railway link
cd backend
npx prisma migrate reset
npx prisma db seed
```

---

## 📱 Environment Variables Summary

### Railway Backend Variables
```env
DATABASE_URL=mysql://...
JWT_SECRET=random-secret-key
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
CLOUDINARY_CLOUD_NAME=optional
CLOUDINARY_API_KEY=optional
CLOUDINARY_API_SECRET=optional
EMAIL_HOST=optional
EMAIL_PORT=optional
EMAIL_USER=optional
EMAIL_PASS=optional
EMAIL_FROM=optional
```

### Vercel Frontend Variables
```env
VITE_API_URL=https://your-backend.up.railway.app
```

---

## 🔄 Continuous Deployment

Both Vercel and Railway support automatic deployments:

- **Vercel**: Automatically deploys when you push to `main` branch
- **Railway**: Automatically deploys when you push to `main` branch

To deploy updates:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

---

## 📊 Monitoring

### Railway
- View logs: Service → **"Deployments"** → **"View Logs"**
- Monitor metrics: Service → **"Metrics"**
- Check database: MySQL service → **"Data"**

### Vercel
- View logs: Project → **"Deployments"** → Click deployment → **"Logs"**
- Monitor analytics: Project → **"Analytics"**
- Check functions: Project → **"Functions"**

---

## 💰 Pricing Notes

### Railway
- Free tier: $5 credit/month
- MySQL database counts toward usage
- Backend service counts toward usage
- Monitor usage in **"Usage"** tab

### Vercel
- Free tier: Hobby plan
- Unlimited bandwidth for personal projects
- 100GB bandwidth for commercial projects

---

## 🎉 Success!

Your Car Rental application is now live!

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.up.railway.app
- **Database**: Managed by Railway

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Railway/Vercel logs
3. Verify all environment variables are set correctly
4. Ensure database migrations completed successfully

---

## 🔒 Security Checklist

Before going to production:

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Update all default passwords
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Review CORS settings
- [ ] Set up proper error logging
- [ ] Configure rate limiting
- [ ] Review database access permissions
- [ ] Set up backup strategy for database
- [ ] Configure environment-specific variables
- [ ] Remove any test/demo credentials

---

## 📝 Post-Deployment Tasks

1. **Test all features thoroughly**
2. **Set up monitoring and alerts**
3. **Configure database backups**
4. **Document your deployment URLs**
5. **Update README with live URLs**
6. **Set up custom domain (optional)**
7. **Configure SSL certificates (automatic)**
8. **Set up error tracking (Sentry, etc.)**

---

Happy Deploying! 🚀
