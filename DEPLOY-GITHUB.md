# Deploy ไป Vercel ผ่าน GitHub

## ขั้นตอนที่ 1: สร้าง GitHub Repository
1. ไปที่ https://github.com/new
2. ตั้งชื่อ repository เช่น `thai-budget-system`
3. เลือก **Public** หรือ **Private**
4. กด **Create repository**

## ขั้นตอนที่ 2: อัปโหลดโค้ดไป GitHub
```bash
# ใน Terminal ของ Replit
git init
git add .
git commit -m "Initial commit - Thai Budget Management System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/thai-budget-system.git
git push -u origin main
```

## ขั้นตอนที่ 3: เชื่อมต่อกับ Vercel
1. ไปที่ https://vercel.com/dashboard
2. กด **New Project**
3. เลือก **Import Git Repository**
4. เลือก repository ที่เพิ่งสร้าง
5. กด **Import**

## ขั้นตอนที่ 4: ตั้งค่า Environment Variables
ใน Vercel Dashboard -> Settings -> Environment Variables:

**จำเป็น:**
```
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
SESSION_SECRET=your-secret-key-here
PGHOST=your-db-host
PGPORT=5432
PGUSER=your-username
PGPASSWORD=your-password
PGDATABASE=your-database-name
```

## ขั้นตอนที่ 5: Deploy
1. Vercel จะ build และ deploy อัตโนมัติ
2. จะได้ URL เช่น `https://thai-budget-system.vercel.app`
3. ทดสอบเข้าสู่ระบบด้วย `korat123/korat123`

## หมายเหตุ
- ทุกครั้งที่ push โค้ดใหม่ไป GitHub, Vercel จะ deploy อัตโนมัติ
- ต้องมี PostgreSQL database ที่สามารถเข้าถึงได้จากอินเทอร์เน็ท
- ใช้ Neon Database (ฟรี) หรือ database provider อื่น ๆ

## การแก้ไขปัญหา
- ถ้า build ล้มเหลว: ตรวจสอบ Environment Variables
- ถ้า database ไม่เชื่อมต่อ: ตรวจสอบ DATABASE_URL
- ถ้า authentication ไม่ทำงาน: ตรวจสอบ SESSION_SECRET