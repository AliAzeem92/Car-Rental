# Quick Deployment Commands

## LOCAL MACHINE

### Backend Preparation
```bash
cd backend
npm install
npx prisma generate
# Upload to /home/username/nodejsapp/ (exclude node_modules)
```

### Frontend Build
```bash
cd frontend
npm install
npm run build
# Upload dist/ contents to /home/username/public_html/
```

---

## CPANEL SERVER (via SSH)

### Initial Backend Setup
```bash
ssh username@yourdomain.com
cd nodejsapp
source /home/username/nodevenv/nodejsapp/18/bin/activate
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
deactivate
```

### Update Backend
```bash
ssh username@yourdomain.com
cd nodejsapp
source /home/username/nodevenv/nodejsapp/18/bin/activate
npm install
npx prisma generate
npx prisma db push
deactivate
# Restart app in cPanel Node.js Manager
```

---

## CPANEL CONFIGURATION

### Node.js App Settings
- Application root: `nodejsapp`
- Application startup file: `server.js`
- Application mode: Production
- Node.js version: 18.x or higher

### Environment Variables (in .env file)
```
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://user:pass@localhost:3306/dbname
JWT_SECRET=your-secret-key
FRONTEND_URL=https://yourdomain.com
```

---

## FILE STRUCTURE

```
/home/username/
├── nodejsapp/              # Backend
│   ├── src/
│   ├── prisma/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── public_html/            # Frontend
    ├── index.html
    ├── assets/
    └── .htaccess
```

---

## TESTING

### Test Backend
```bash
curl https://yourdomain.com/api
```

### Test Frontend
Open browser: https://yourdomain.com

---

## TROUBLESHOOTING

### Backend not starting
1. Check Node.js version (18+)
2. Verify .env file exists
3. Check cPanel error logs
4. Run: npx prisma generate

### Frontend blank page
1. Check browser console
2. Verify .htaccess exists
3. Clear browser cache
4. Check API proxy in .htaccess

### Database errors
1. Verify DATABASE_URL
2. Check MySQL user privileges
3. Run: npx prisma db push
4. Test in phpMyAdmin
