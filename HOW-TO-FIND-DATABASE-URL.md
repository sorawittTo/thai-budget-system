# วิธีหา DATABASE_URL ใน Replit

## วิธีที่ 1: ใช้ Command Line
ใน Shell tab ของ Replit:
```bash
echo $DATABASE_URL
```

## วิธีที่ 2: ดูใน Environment Variables
1. ไปที่ sidebar ซ้าย
2. มองหา icon รูป "lock" หรือ "key" 
3. หรือไปที่ Settings -> Environment Variables
4. จะเห็น DATABASE_URL

## วิธีที่ 3: ดูใน .env file (ถ้ามี)
```bash
cat .env
```

## วิธีที่ 4: ดูใน Replit Database tab
1. ไปที่ Database tab (icon รูป database)
2. จะเห็น connection string

## ตำแหน่งที่เป็นไปได้:
- แท็บ "Secrets" ใน sidebar
- แท็บ "Environment Variables" 
- แท็บ "Database" 
- Settings -> Environment Variables

## หากไม่เจอ:
ใช้คำสั่งใน Shell:
```bash
# ดู environment variables ทั้งหมด
printenv | grep -i database

# ดู PostgreSQL variables
printenv | grep -i pg
```

ลองรันคำสั่งใน Shell tab ก่อนครับ!