# ตรวจสอบสถานะ Deployment

## ขั้นตอนตรวจสอบใน Vercel:

### 1. ดู Deployment Status
- ไปที่ https://vercel.com/dashboard
- เลือก project `thai-budget-system`
- ดูแท็บ **Deployments**
- สถานะควรจะเป็น:
  - ✅ Ready (สำเร็จ)
  - 🔄 Building (กำลัง build)
  - ❌ Failed (ล้มเหลว)

### 2. หาก Build ล้มเหลว
คลิกที่ deployment ที่ล้มเหลว และดู:
- **Build Logs**: ข้อความ error ตอน build
- **Function Logs**: ข้อความ error ตอนรัน

### 3. ปัญหาที่พบบ่อย:

#### Build Error:
```
Error: Cannot find module 'dist/index.js'
```
**แก้ไข**: ต้อง build โปรเจคก่อน deploy

#### Database Error:
```
Error: Connection to database failed
```
**แก้ไข**: ตรวจสอบ DATABASE_URL ใน Environment Variables

#### Session Error:
```
Error: SESSION_SECRET is required
```
**แก้ไข**: เพิ่ม SESSION_SECRET ใน Environment Variables

### 4. วิธีแก้ไขทั่วไป:
1. ตั้งค่า Environment Variables ให้ครบ
2. Redeploy ใหม่
3. ตรวจสอบ logs อีกครั้ง

### 5. Environment Variables ที่ต้องมี:
- DATABASE_URL
- SESSION_SECRET
- NODE_ENV

สถานะปัจจุบันของ deployment เป็นอย่างไร?