# ขั้นตอนการ Push ไป GitHub

## 1. เตรียม GitHub Repository
ก่อนอื่นให้ไปสร้าง repository ใน GitHub:
- ไปที่ https://github.com/new
- ชื่อ repository: `thai-budget-system`
- เลือก Public หรือ Private
- **อย่าเพิ่ม** README, .gitignore, license (เพราะมีแล้ว)
- กด **Create repository**

## 2. คำสั่งสำหรับ Shell ใน Replit
คัดลอกและรันทีละคำสั่งในแท็บ **Shell** ของ Replit:

```bash
# ล้าง git locks หากมี
rm -f .git/index.lock .git/config.lock

# ตรวจสอบสถานะ
git status

# เพิ่มไฟล์ทั้งหมด
git add .

# Commit การเปลี่ยนแปลง
git commit -m "Thai Budget Management System - Ready for deployment"

# ตั้งค่า remote (แก้ YOUR_USERNAME เป็นชื่อผู้ใช้ GitHub ของคุณ)
git remote add origin https://github.com/YOUR_USERNAME/thai-budget-system.git

# Push ไป GitHub
git push -u origin main
```

## 3. หลังจาก Push สำเร็จ
ไปที่ https://vercel.com/dashboard และ:
1. กด **New Project**
2. เลือก **Import Git Repository**
3. เลือก repository `thai-budget-system`
4. กด **Import**

## 4. ตั้งค่า Environment Variables ใน Vercel
ไปที่ Settings -> Environment Variables:
- `DATABASE_URL`: จาก Replit database
- `SESSION_SECRET`: สตริงแบบสุ่ม เช่น `budget-secret-2025`

## 5. Deploy
Vercel จะ build และ deploy อัตโนมัติ

**พร้อมแล้ว!** ลองรัน Shell command ทีละขั้นตอนเลย