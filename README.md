# HR Manager & Salary Analytics System

Student: std6730202211 · Backend assigned port: 3022

ชื่อโฟลเดอร์/ชื่อ repo: **Std0202211IPFinal2026** (เลขท้าย 7 หลัก `0202211` แทน `6xxxxxx` ทั้งชุดตาม PDF)

## ขอบเขต

React Native + Expo frontend, Express backend, mock login `admin` / `password123` ตามข้อสอบ, employee CRUD, toggle status, Edit ชื่อ/ตำแหน่ง/เงินเดือน/สถานะ, Search ชื่อ/ตำแหน่ง และ 1D K-Means k=3 พร้อม loading และ summary cards

เงื่อนไขล่าสุดของผู้ใช้แทน in-memory ด้วย MySQL อาจารย์เท่านั้น: `ip_std6730202211` ใช้ตาราง `ThaKet_employees` และทุกคอลัมน์ขึ้นต้น `ThaKet_` ไม่อ่านหรือเขียน Inventory/users ไม่สร้าง database ไม่เพิ่มระบบสมัครสมาชิกหรือ JWT จริง

## เริ่ม backend

ต้องมี Node.js >=20.19 (ใช้ Node 24 ตรวจในเครื่องนี้)

```powershell
cd backend
npm ci
Copy-Item .env.example .env
# กรอก DB_PASSWORD และยืนยัน DB_HOST/DB_USER/DB_PORT ใน .env ด้วยตนเอง
# DB_NAME ต้องเป็น ip_std6730202211 เท่านั้น
npm run db:setup
npm start
```

`.env` อยู่ข้าง `server.js` และถูก gitignore ห้ามใส่ password ลง README, source หรือ EXPO_PUBLIC_* ค่า localhost เป็นตัวอย่างจากสไลด์เมื่อ backend รันบน cloud ต้องยืนยันกับอาจารย์ ไม่ได้แปลว่า MySQL cloud เปิดรับจากเครื่องส่วนตัว

ก่อนรัน `db:setup` อ่าน `backend/schema.sql` และ `backend/setup-db.js`: สร้างเฉพาะตารางใหม่ ถ้าตารางว่างจะเพิ่ม 5 คน ถ้ามีข้อมูลแล้วจะเก็บไว้และไม่ seed ซ้ำ ไม่รัน setup อัตโนมัติเมื่อเปิด server หากมีตารางชื่อนี้อยู่แต่ schema ไม่ตรง ให้หยุดตรวจสอบ ห้าม drop/alter งานเดิม

## เริ่ม frontend

```powershell
cd frontend
npm ci
Copy-Item .env.example .env
# ตั้ง EXPO_PUBLIC_API_URL ให้ชี้ backend ที่รันจริง แล้ว restart Expo
npm start
# หรือ npm run web
```

ตั้งต้น `http://119.59.102.161:3022/api` ตาม assigned port แต่ยังไม่ยืนยันว่ามี backend ของโปรเจกต์ทำงานอยู่ หากรัน backend ในเครื่อง ให้ใช้ LAN IP ของคอมพิวเตอร์สำหรับโทรศัพท์ (โทรศัพท์ใช้ localhost ของคอมไม่ได้), Android emulator ใช้ `http://10.0.2.2:3022/api` หน้า web ใช้ `http://localhost:3022/api` ได้ ตัวอย่าง HTTP cloud ใช้ตามสไลด์ หากเปิด frontend ผ่าน HTTPS อาจถูก browser บล็อก HTTP API ให้ใช้ URL HTTPS proxy ที่อาจารย์จัดให้และทดสอบจริง

ใช้ Expo SDK 54 / React Native 0.81 / React 19.1 ตาม [Expo version matrix](https://docs.expo.dev/versions/v54.0.0/). ต้องใช้ Expo Go/development build ที่รองรับ SDK 54 ยังไม่ได้ทดสอบบนอุปกรณ์จริง

## API

ทุก employee endpoint ต้องส่ง `Authorization: Bearer mock-jwt-token` (เป็น mock ตามโจทย์ ไม่ใช่ JWT จริง)

| Method | Path | ผล |
|---|---|---|
| POST | /api/login | body username/password; 200 ตาม schema ข้อสอบ หรือ 401 |
| GET | /api/employees?search= | employee array ค้นหาชื่อ/ตำแหน่ง |
| POST | /api/employees | name, position, salary; status optional default Active; 201 |
| PUT | /api/employees/:id | name, position, salary, status ครบ; 200 |
| PUT | /api/employees/:id/status | toggle Active / On Leave; 200 |
| DELETE | /api/employees/:id | success true; ต้องยืนยัน Alert ใน frontend ก่อน |
| GET | /api/employees/salary-clusters | success true และ clusters group/centroid/count |

API map เป็น `id` (string), `name`, `position`, `status`, `salary` (number) เสมอ Input ชื่อ/ตำแหน่งไม่เกิน 100 ตัวอักษร เงินเดือนบวกและไม่เกิน 9,999,999,999.99 ทศนิยมไม่เกิน 2 ตำแหน่ง; ผิดส่ง 400, ไม่พบ id ส่ง 404, DB ล้มเหลวส่ง 500 โดยไม่เผยรายละเอียด credentials

K-Means ใช้ salary ของพนักงานทั้งหมด (รวม On Leave) ไม่ใช้ผล Search เลือก centroid เริ่มต้นแบบ deterministic farthest-point แล้ววน assign/mean ไม่เกิน 100 รอบ จัด Tier ตาม centroid ต่ำไปสูง หากข้อมูลว่าง/เงินเดือนแตกต่างกันไม่ถึง 3 ค่า จะคืน 3 cards โดย tier ว่างมี count=0, centroid=null (แสดง —) ไม่สร้างค่าเฉลี่ยปลอม หลัง mutation จะ refresh รายการจาก API และคำนวณ analytics ใหม่ถ้าเคยเปิดแล้ว

## Deploy ตามสไลด์ React Native + Cloud DB

1. SSH/SFTP host `119.59.102.161`, port `2222`, user `std6730202211` กรอกรหัสผ่านเอง ไม่เก็บใน repo
2. ตรวจ `pwd`, `id`, `ls -ld /app` และสิทธิ์ directory ของบัญชีก่อน upload สไลด์แสดง /app แต่กล่าวถึง home ของแต่ละบัญชีด้วย จึงต้องยืนยัน path ที่อนุญาตจริง ห้ามเขียนทับ app ที่มีอยู่
3. Upload **backend** ไปโฟลเดอร์ใหม่ในพื้นที่ของบัญชี ตั้ง `.env` ข้าง `server.js` บน server และ `chmod 600 .env`
4. อ่าน schema ก่อนรัน แล้ว `npm ci`, `npm run db:setup`, `npm start` ใช้ port 3022 เท่านั้น ไม่หยุด process ของคนอื่นถ้า port ถูกใช้
5. ทดสอบ login, employees และ analytics ผ่าน URL จริง แล้วตั้ง frontend API URL ตามผลทดสอบ อย่าสรุปว่าสำเร็จจาก TCP reachability อย่างเดียว

สถานะล่าสุด: ผู้ใช้เข้า SSH และรัน backend บน Cloud port 3022 แล้ว พร้อมยืนยันการใช้งานผ่าน frontend และแสดง Dashboard 5 คน ผู้ช่วยไม่ได้ทดสอบ CRUD กับ Cloud DB โดยตรงในรอบเผยแพร่ ไม่มี credentials รวมอยู่ใน repository

## ตรวจสอบ

```powershell
cd backend
npm test
cd ../frontend
npm run typecheck
npx expo install --check
npm run build:web
```

backend tests inject repository mock เฉพาะชุดทดสอบ ไม่ใช่ production storage และไม่พิสูจน์ live MySQL integration ต้องตรวจ CRUD/seed persistence กับ DB อาจารย์หลังตั้งค่า ดู `VERIFICATION.md` สำหรับผลที่รันจริง

อ้างอิง pool pattern เฉพาะ `mysql2/promise`, env และ bound queries จาก [reference server.js](https://github.com/tharitten1234/slac-cpu-shop/blob/master/server.js) ไม่คัดลอก Inventory/users หรือฟีเจอร์ร้านค้า

Repository นี้เผยแพร่ตามคำสั่งผู้ใช้ โดยใช้เวอร์ชัน final-ip ที่มี Thai/English และยังไม่มี sidebar/ตาราง UI จากสำเนาใหม่ การส่ง LMS เป็นขั้นตอนแยกและยังไม่ได้ดำเนินการ
