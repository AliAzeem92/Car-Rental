# ⚡ Quick Deployment Checklist

## 🗄️ Railway - Database (5 minutes)

1. Go to https://railway.app
2. New Project → Provision MySQL
3. Copy `DATABASE_URL` from Variables tab

## 🔧 Railway - Backend (10 minutes)

1. New Project → Deploy from GitHub
2. Select your repo
3. Settings → Root Directory: `backend`
4. Variables → Add:
   ```
   DATABASE_URL=<from-mysql-service>
   JWT_SECRET=<random-string>
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=<will-add-later>
   ```
5. Settings → Generate Domain
6. Copy backend URL

## 🎨 Vercel - Frontend (5 minutes)

1. Go to https://vercel.com
2. New Project → Import from GitHub
3. Root Directory: `frontend`
4. Environment Variables:
   ```
   VITE_API_URL=<your-railway-backend-url>
   ```
5. Deploy
6. Copy Vercel URL

## 🔄 Final Step

1. Go back to Railway backend
2. Update `FRONTEND_URL` variable with Vercel URL
3. Done! 🎉

---

## 📋 URLs to Save

- Frontend: `https://________.vercel.app`
- Backend: `https://________.up.railway.app`
- Database: Railway MySQL (internal)

---

## 🧪 Test

Visit your frontend URL and try:
- ✅ View vehicles
- ✅ Register account
- ✅ Login
- ✅ Make reservation

---

For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
