# HR Manager & Salary Analytics System

แอปจัดการพนักงานและวิเคราะห์โครงสร้างเงินเดือน สำหรับวิชา Internet Programming — Final Exam 2026 พัฒนาด้วย **React Native (Expo), Express.js และ MySQL**

รหัสนิสิต: `6730202211` · บัญชี Cloud: `std6730202211` · Backend port: `3022`

ชื่อ repository `Std0202211IPFinal2026` ใช้เลขท้าย 7 หลักของรหัสนิสิต (`0202211`) ตามรูปแบบที่กำหนดในข้อสอบ

## ความสามารถ

- Login ด้วยบัญชีจำลองตามโจทย์
- แสดง เพิ่ม แก้ไข และลบพนักงาน โดยยืนยันก่อนลบ
- แก้ชื่อ ตำแหน่ง เงินเดือน และสถานะ `Active` / `On Leave`
- ค้นหาจากชื่อหรือตำแหน่ง และสลับสถานะพนักงาน
- วิเคราะห์เงินเดือนด้วย 1D K-Means (`k=3`) แสดงจำนวนคนและเงินเดือนเฉลี่ยของแต่ละกลุ่ม
- แสดง loading/error และอัปเดตรายการหลังดำเนินการผ่าน API
- สลับไทย/English มีเมนูนำทาง ตารางบน desktop และการ์ดบนมือถือ

การจัดเก็บข้อมูลใช้ MySQL ตามเงื่อนไขเพิ่มเติมของงาน แทน in-memory array ในข้อสอบเดิม ใช้เฉพาะฐานข้อมูล `ip_std6730202211` และตาราง `ThaKet_employees` ไม่แก้ตาราง `Inventory` หรือ `users` และไม่สร้างฐานข้อมูลอื่น

## โครงสร้างโปรเจกต์

```text
Std0202211IPFinal2026/
├── backend/
│   ├── server.js          # เริ่ม server และตรวจการเชื่อมต่อ DB
│   ├── app.js             # Login, employee API และ validation
│   ├── db.js              # MySQL connection pool และโหลด .env
│   ├── repository.js      # SQL และ map ชื่อฟิลด์สำหรับ API
│   ├── clusters.js        # K-Means
│   ├── schema.sql         # โครงสร้างตาราง
│   ├── setup-db.js        # สร้างตารางและ seed เมื่อว่าง
│   ├── app.test.js        # ชุดทดสอบด้วย mock repository
│   └── .env.example
├── frontend/
│   ├── App.tsx            # หน้าจอและการโต้ตอบ
│   ├── api.ts             # เรียก API พร้อม token และ timeout
│   ├── public/favicon.svg
│   └── .env.example
└── VERIFICATION.md        # ขอบเขตและผลตรวจสอบ
```

เส้นทางข้อมูล: **หน้าจอ → `frontend/api.ts` → Express API → MySQL → ผลลัพธ์กลับมาอัปเดตหน้าจอ** ส่วน Analytics อ่านเงินเดือนปัจจุบันจาก DB แล้วคำนวณบน backend

## สิ่งที่ต้องมี

- Git หรือดาวน์โหลด ZIP จากปุ่ม **Code → Download ZIP** แล้วแตกไฟล์
- Node.js และ npm: แนะนำ Node.js 24 ซึ่งใช้ตรวจงานนี้
- สำหรับมือถือ: Expo Go ที่รองรับ **Expo SDK 54** หรือ development build ที่ตรง SDK ของโปรเจกต์
- หากต้องรัน backend เอง: บัญชี SSH/SFTP และ MySQL ที่อาจารย์อนุญาตให้ใช้

Repository ไม่มีรหัสผ่านหรือไฟล์ `.env` จริง ผู้ที่ต้องตั้งค่า backend ให้ขอ credentials ผ่านช่องทางของรายวิชา ไม่ใส่ไว้ใน GitHub หรือ `EXPO_PUBLIC_*`

## 1. ดาวน์โหลดโปรเจกต์

เปิด Terminal ในตำแหน่งที่ต้องการเก็บงาน:

```bash
git clone https://github.com/tharitten1234/Std0202211IPFinal2026.git
cd Std0202211IPFinal2026
```

ถ้าดาวน์โหลด ZIP ให้เปิด Terminal ในโฟลเดอร์ที่มี `backend/` และ `frontend/` โดยตรง คำสั่งถัดไปอ้างจากโฟลเดอร์หลักนี้

## 2. ทดลอง frontend กับ Cloud backend

วิธีนี้ไม่ต้องเปิด backend เพิ่มในเครื่องผู้ตรวจ แต่ต้องมี backend ของโปรเจกต์ทำงานบน Cloud และเครื่องผู้ตรวจเข้าถึงได้

ใน Terminal ช่องแรก:

```bash
cd frontend
npm ci
```

สร้าง `frontend/.env` จากไฟล์ตัวอย่าง **เฉพาะครั้งแรก**:

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

```bash
# macOS / Linux
cp .env.example .env
```

ตรวจให้มีบรรทัดนี้ใน `frontend/.env`:

```dotenv
EXPO_PUBLIC_API_URL=http://119.59.102.161:3022/api
```

เปิดเว็บสำหรับตรวจ UI:

```bash
npm run web
```

เปิด URL ที่ Expo แสดงใน Terminal (มักเป็น `http://localhost:8081` แต่อาจเป็น port อื่น) หรือหากต้องตรวจบนมือถือ ให้ใช้:

```bash
npm start
```

สแกน QR จาก Terminal ด้วย Expo Go ที่รองรับ SDK ของโปรเจกต์ โดยคอมพิวเตอร์กับโทรศัพท์อยู่ในเครือข่ายเดียวกัน การรันบนเว็บช่วยตรวจ flow ได้ แต่ไม่ทดแทนการตรวจ React Native บนอุปกรณ์จริง

### บัญชีสำหรับตรวจงาน

| ช่อง | ค่า |
|---|---|
| Username | `admin` |
| Password | `password123` |

นี่เป็น **mock login ตามข้อสอบ** ไม่ใช่บัญชี SSH หรือ MySQL และ token `mock-jwt-token` ไม่ใช่ระบบ JWT สำหรับใช้งานจริง

หาก Login แล้วเชื่อมต่อไม่ได้ ให้ตรวจสถานะ Cloud backend ตามหัวข้อถัดไป การ clone repository ไม่ได้เริ่ม server บน Cloud ให้อัตโนมัติ

## 3. เตรียมและรัน backend บน Cloud

ทำส่วนนี้เมื่อต้องติดตั้ง backend ใหม่ หรือ Cloud backend ยังไม่ทำงาน หากมี server เดิมทำงานอยู่ที่ port `3022` ไม่ต้องเริ่มอีกตัว

### 3.1 เชื่อมต่อและวางไฟล์

```bash
ssh -p 2222 std6730202211@119.59.102.161
```

ใช้บัญชีที่ได้รับอนุญาต แล้วตรวจ `pwd` และสิทธิ์ของ `/app` ก่อนวางไฟล์ ใช้โฟลเดอร์โปรเจกต์แยก เช่น `/app/Std0202211IPFinal2026/backend` อย่าเขียนทับ `/app/server.js` หรืองานเดิม

อัปโหลดโฟลเดอร์ `backend` ผ่าน SFTP โดยใช้ host/user/port เดียวกับ SSH ไม่ต้องอัปโหลด `node_modules` หรือ `.env` จากคอม หากมี backend อยู่แล้ว ให้ใช้ path จริงที่ติดตั้งไว้ ไม่สร้างชุดซ้ำโดยไม่จำเป็น

### 3.2 ตั้งค่าฐานข้อมูล

เข้าโฟลเดอร์ `backend` บน Cloud ที่มี `server.js`, `setup-db.js` และ `package.json` จากนั้นสร้าง `.env` เฉพาะครั้งแรก:

```bash
cp .env.example .env
chmod 600 .env
nano .env
```

กรอกค่าจริงตามบัญชี MySQL ที่ได้รับ:

```dotenv
PORT=3022
DB_HOST=localhost
DB_PORT=3306
DB_USER=std6730202211
DB_PASSWORD=
DB_NAME=ip_std6730202211
```

ต้องเติม `DB_PASSWORD` เอง ช่องว่างในตัวอย่างไม่ใช่รหัสผ่านใช้งานจริง กด `Ctrl+O` → `Enter` เพื่อบันทึกใน nano แล้ว `Ctrl+X` เพื่อออก

`localhost` ในขั้นตอนนี้หมายถึง MySQL บน Cloud ที่ backend กำลังรัน ไม่ใช่ MySQL บนคอมผู้ตรวจ รหัสผ่าน SSH กับ MySQL อาจต่างกัน บัญชีนี้เคยถูกปฏิเสธ SSH forwarding (`administratively prohibited`) จึงใช้วิธีรัน backend บน Cloud แทน SSH tunnel

### 3.3 สร้างตารางและเริ่ม API

จากโฟลเดอร์ `backend` บน Cloud:

```bash
npm ci
npm run db:setup
npm start
```

- `db:setup` ใช้ฐานข้อมูลเดิม `ip_std6730202211` สร้างเฉพาะ `ThaKet_employees` หากยังไม่มี และเพิ่มพนักงาน 5 คนเมื่อตารางว่าง
- ถ้ามีข้อมูลแล้วจะไม่ seed ซ้ำหรือรีเซ็ตข้อมูล ไม่จำเป็นต้องรัน setup ทุกครั้งที่เริ่ม server
- ทุกคอลัมน์ขึ้นต้น `ThaKet_`: `ThaKet_id`, `ThaKet_name`, `ThaKet_position`, `ThaKet_status`, `ThaKet_salary`
- ถ้ามีตารางชื่อนี้อยู่แต่โครงสร้างไม่ตรง ให้ตรวจสอบกับผู้ดูแล ไม่ลบหรือแก้ตารางเดิมเพื่อบังคับให้รันผ่าน

เมื่อเริ่มสำเร็จจะแสดง `HR API listening on port 3022` ให้เปิด Terminal นี้ค้างไว้ การรันด้วย `npm start` แบบนี้ไม่ได้รับประกันว่า process จะทำงานต่อหลังปิด SSH

**URL สำหรับ frontend:** `http://119.59.102.161:3022/api`

การเปิด `http://119.59.102.161:3022/` แล้วได้ `{"error":"Endpoint not found"}` เป็นผลปกติ เพราะไม่มีหน้าเว็บหรือ endpoint ที่ `/` ส่วน `/api/employees` ต้องแนบ Bearer token จึงจะอ่านข้อมูลได้

## 4. ลำดับตรวจฟังก์ชัน

รายการด้านล่างเป็นขั้นตอนตรวจรับ ไม่ใช่การยืนยันว่าทดสอบ Cloud ครบแล้ว การเพิ่ม/แก้ไข/ลบจะเปลี่ยนข้อมูลใน DB ที่กำลังเชื่อมต่อจริง

| ขั้นตอน | ผลที่ควรได้ |
|---|---|
| Login ด้วยรหัสผิด แล้วใช้บัญชีข้างต้น | ผิดแสดง alert; ถูกเข้าสู่ Dashboard |
| เปิดรายการหลัง setup ครั้งแรก | มีพนักงานตั้งต้น 5 คน (จำนวนอาจเปลี่ยนเมื่อมีการใช้งานต่อ) |
| กดเพิ่มโดยเว้นช่องว่างหรือเงินเดือนผิด | แจ้ง validation และไม่บันทึก |
| เพิ่มพนักงาน | รายการและสถิติอัปเดตจาก API |
| Edit ชื่อ ตำแหน่ง เงินเดือน และสถานะ | บันทึกและแสดงค่าที่แก้ไข |
| Search ด้วยชื่อและตำแหน่ง แล้วล้างค้นหา | แสดงผลตรงคำค้นและกลับมาครบทุกรายการ |
| เปลี่ยนสถานะ | สลับ Active / On Leave และสถิติอัปเดต |
| Delete แล้วกดยกเลิก | รายการยังอยู่ |
| Delete แล้วกดยืนยัน | รายการถูกลบและหน้าจออัปเดต |
| Analyze Salary Structure | มี loading แล้วแสดง 3 กลุ่มพร้อมจำนวนคนและค่าเฉลี่ย |
| เปลี่ยนข้อมูลหลังเปิด Analytics | คำนวณผล Analytics ใหม่ |
| Refresh และ Login ใหม่ | ข้อมูลที่บันทึกยังอยู่ใน MySQL |
| สลับไทย/English และลองจอแคบ/จอกว้าง | ภาษาเปลี่ยนและ layout ปรับตามหน้าจอ |

สถิติด้านบนแสดง **ตามผลค้นหาปัจจุบัน** ส่วน Analytics ใช้ **พนักงานทั้งหมด รวม On Leave** ไม่จำกัดตามคำค้น

## 5. API และข้อมูล

| Method | Endpoint | Request / ผลลัพธ์ |
|---|---|---|
| POST | `/api/login` | username/password; สำเร็จ 200 พร้อม success/token, ผิด 401 |
| GET | `/api/employees?search=` | employee array; ค้นหาชื่อ/ตำแหน่ง |
| POST | `/api/employees` | name, position, salary; status ไม่ส่งจะเป็น Active; สำเร็จ 201 |
| PUT | `/api/employees/:id` | name, position, salary, status ครบ; สำเร็จ 200 |
| PUT | `/api/employees/:id/status` | toggle สถานะ; สำเร็จ 200 |
| DELETE | `/api/employees/:id` | สำเร็จ 200 พร้อม success |
| GET | `/api/employees/salary-clusters` | success และ clusters: group/centroid/count |

ทุก employee endpoint ต้องส่ง `Authorization: Bearer mock-jwt-token` ชื่อฟิลด์ใน API เป็น `id` (string), `name`, `position`, `status`, `salary` (number) แม้คอลัมน์ DB จะมี prefix

ชื่อและตำแหน่งต้องไม่ว่างและยาวไม่เกิน 100 ตัวอักษร เงินเดือนต้องเป็นตัวเลขมากกว่า 0 สูงสุด `9999999999.99` และทศนิยมไม่เกิน 2 ตำแหน่ง ข้อมูลผิดส่ง 400, ไม่มี record ส่ง 404, ไม่ส่ง token/ไม่ถูกต้องส่ง 401 และ DB request ล้มเหลวส่ง 500

K-Means เลือกค่าเริ่มต้นแบบ deterministic farthest-point แล้ววน assignment/mean ไม่เกิน 100 รอบ เรียง Tier จากเงินเดือนต่ำไปสูง `centroid` คือเงินเดือนเฉลี่ยของกลุ่ม (ปัดทศนิยม 2 ตำแหน่ง) หากข้อมูลว่างหรือมีเงินเดือนต่างกันไม่ถึง 3 ค่า กลุ่มที่ไม่มีข้อมูลจะมี `count: 0`, `centroid: null` และ UI แสดง `—`

## 6. คำสั่งตรวจโค้ด

จากโฟลเดอร์หลัก หลังติดตั้ง dependencies ทั้งสองส่วนแล้ว:

```bash
cd backend
npm test
cd ../frontend
npm run typecheck
npx expo install --check
npm run build:web
npx expo export --platform android --output-dir dist-android
```

Backend tests ใช้ mock repository จึงไม่ต้องมี `.env` หรือ MySQL เพื่อรันทดสอบ แต่ `npm start` ใช้ MySQL จริงเท่านั้น ไม่มี in-memory fallback ผล build ไม่ใช่หลักฐานว่ารันผ่านบนโทรศัพท์หรือเชื่อม DB จริงแล้ว ดูขอบเขตการตรวจใน [VERIFICATION.md](VERIFICATION.md)

## 7. ปัญหาที่พบบ่อย

| อาการ | สิ่งที่ควรตรวจ |
|---|---|
| Login แจ้งเชื่อมต่อไม่ได้ / timeout | Cloud backend ยังเปิดอยู่หรือไม่, URL ลงท้าย `/api`, เครือข่ายเข้าถึง port 3022 ได้หรือไม่ |
| แก้ frontend `.env` แล้วไม่เปลี่ยน | หยุด Expo แล้วเริ่มใหม่; หน้าเว็บลอง Ctrl+Shift+R |
| DB connection refused ขณะรันบนคอม | `localhost` ชี้คอมเครื่องนั้น; ใช้ backend บน Cloud ตามขั้นตอนนี้ |
| SSH แจ้ง administratively prohibited | บัญชีไม่อนุญาต forwarding ไปปลายทาง หลีกเลี่ยงวิธี tunnel และใช้ backend บน Cloud |
| MySQL access denied | ตรวจบัญชี/รหัสผ่าน MySQL และสิทธิ์ DB กับผู้ดูแล |
| Startup failed | ตรวจ backend `.env`, ตาราง ThaKet_employees, สิทธิ์อ่าน DB และ port 3022 |
| Port 3022 ถูกใช้แล้ว | ตรวจ server ที่ทำงานอยู่ ไม่เปิดซ้ำหรือปิด process โดยไม่ทราบเจ้าของ |
| Expo Go ไม่รองรับโปรเจกต์ | ใช้ Expo Go/development build ที่รองรับ SDK 54 |
| เว็บ HTTPS เรียก HTTP API ไม่ได้ | Browser อาจบล็อก mixed content; ใช้ backend HTTPS ที่ผู้ดูแลจัดให้ |

กรณีผู้ดูแลอนุญาต backend ในเครื่องให้เข้าถึง **DB อาจารย์เดิม** ได้จริง: web ในคอมใช้ `http://localhost:3022/api`, Android emulator ใช้ `http://10.0.2.2:3022/api` และมือถือใช้ LAN IP ของคอม ไม่ใช้ localhost ของโทรศัพท์ ห้ามเปลี่ยนเป็น DB ใหม่เพื่อหลีกเลี่ยงข้อกำหนดงาน

## อ้างอิง

- โจทย์ Final Exam: HR Manager & Salary Analytics System และสไลด์ React Native + Cloud DB ของรายวิชา
- [Expo SDK 54 documentation](https://docs.expo.dev/versions/v54.0.0/)
- [ตัวอย่าง Express/mysql2 connection pool](https://github.com/tharitten1234/slac-cpu-shop/blob/master/server.js) ใช้อ้างอิงรูปแบบเชื่อมต่อเท่านั้น
