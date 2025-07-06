# การตั้งค่า Environment Variables ใน Vercel

## ขั้นตอนที่ 1: เข้าสู่ Vercel Dashboard
1. ไปที่ https://vercel.com/dashboard
2. เข้าสู่ระบบด้วย GitHub account
3. หา project `thai-budget-system` ที่ import มา

## ขั้นตอนที่ 2: เข้าสู่ Project Settings
1. คลิกที่ project name
2. คลิก **Settings** (ด้านบน)
3. คลิก **Environment Variables** (ด้านซ้าย)

## ขั้นตอนที่ 3: เพิ่ม Environment Variables
เพิ่มตัวแปรเหล่านี้ทีละตัว:

### 3.1 DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: `postgresql://neondb_owner:npg_QULjTaO5kXJ9@ep-late-poetry-aevarp3d.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require`
- **Environment**: เลือก `Production`, `Preview`, `Development` (ทั้งหมด)
- กด **Add**

### 3.2 SESSION_SECRET
- **Name**: `SESSION_SECRET`
- **Value**: `budget-secret-2025`
- **Environment**: เลือกทั้งหมด
- กด **Add**

### 3.3 NODE_ENV
- **Name**: `NODE_ENV`
- **Value**: `production`
- **Environment**: เลือกเฉพาะ `Production`
- กด **Add**

## ขั้นตอนที่ 4: Redeploy
1. ไปที่ **Deployments** tab
2. คลิก **...** (3 dots) ที่ deployment ล่าสุด
3. เลือก **Redeploy**
4. รอการ deploy เสร็จ

## ขั้นตอนที่ 5: ทดสอบ
1. เข้าไปที่ URL ที่ Vercel ให้มา
2. ทดสอบเข้าสู่ระบบ: `korat123` / `korat123`
3. ตรวจสอบการทำงานของแต่ละโมดูล

## หมายเหตุ
- ถ้า build ล้มเหลว: ตรวจสอบ Environment Variables
- ถ้า database ไม่เชื่อมต่อ: ตรวจสอบ DATABASE_URL
- ถ้า login ไม่ได้: ตรวจสอบ SESSION_SECRET