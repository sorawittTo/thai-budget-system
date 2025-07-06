# วิธีการ Deploy ไป Vercel

## ขั้นตอนการ Deploy

### 1. เตรียมโค้ด
```bash
# ดาวน์โหลด/clone โปรเจค
git clone <repository-url>
cd budget-management-system
```

### 2. ติดตั้ง Vercel CLI
```bash
npm install -g vercel
```

### 3. Login เข้า Vercel
```bash
vercel login
```

### 4. Deploy โปรเจค
```bash
vercel --prod
```

### 5. ตั้งค่า Environment Variables ใน Vercel Dashboard

ไปที่ https://vercel.com/dashboard แล้วตั้งค่า:

**จำเป็น:**
- `DATABASE_URL`: PostgreSQL connection string
- `PGHOST`: Database host
- `PGPORT`: Database port (5432)
- `PGUSER`: Database username
- `PGPASSWORD`: Database password
- `PGDATABASE`: Database name
- `SESSION_SECRET`: random string สำหรับ session

**ตัวอย่าง DATABASE_URL:**
```
postgresql://username:password@hostname:5432/database_name
```

### 6. ทดสอบระบบ
- เข้าสู่ระบบด้วย: `korat123` / `korat123`
- ตรวจสอบการทำงานของทุกโมดูล

## โครงสร้างโปรเจค สำหรับ Vercel
```
/
├── api/
│   └── index.js          # Serverless function entry point
├── client/               # React frontend
├── server/               # Express backend
├── shared/               # Shared types/schemas
├── package.json          # Dependencies
├── vercel.json           # Vercel configuration
└── tsconfig.json         # TypeScript config
```

## หมายเหตุ
- ระบบใช้ PostgreSQL สำหรับฐานข้อมูลถาวร
- Authentication ใช้ express-session + passport.js
- Frontend build ด้วย Vite
- Backend bundle ด้วย esbuild