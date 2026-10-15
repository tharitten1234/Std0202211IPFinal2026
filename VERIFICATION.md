# ขอบเขตการตรวจสอบ

อัปเดต: 15 ตุลาคม 2026

## ผลตรวจในเครื่อง

| รายการ | ผล |
|---|---|
| Backend `npm test` | ผ่าน 5/5 ชุด |
| Frontend `npm run typecheck` | ผ่าน |
| `npx expo install --check` | dependencies เข้ากัน (ตรวจช่วงเตรียมโปรเจกต์) |
| `npm run build:web` | ผ่าน |
| Android export ผ่าน Metro/Hermes | ผ่าน; เป็น bundle ไม่ใช่ APK/device test |
| `git diff --check` | ผ่านก่อนเผยแพร่ |

Backend tests ครอบคลุม mock login/auth, CRUD/search/toggle, validation และ 400/404/500, K-Means edge cases และ MySQL field mapping/bound parameters โดยใช้ **mock repository** ไม่ใช่ live database

## Browser UI

ตรวจด้วย Chrome headless และ **API mock**:

- Login ผิด/ถูก และ client validation
- Add, Edit ทุกฟิลด์, Search/Clear, Toggle
- Delete ยกเลิก/ยืนยัน
- Analytics loading/summary cards และการ refresh ผลหลัง mutation
- ไทย/English, generic favicon และเมนูไฮไลต์ตามการเลื่อน
- Layout ขนาด 320/430/1440 pixels; ไม่พบ desktop/320px horizontal overflow หรือ JavaScript page errors ใน flow ที่ทดสอบ

## Cloud และข้อจำกัด

- ผู้พัฒนายืนยันการเข้า SSH, เริ่ม backend port 3022 และใช้งาน frontend โดยแสดง Dashboard พนักงาน 5 คนระหว่างเตรียมงาน
- หลักฐานข้างต้นไม่ใช่ automated live-DB test ครบทุก endpoint และไม่รับประกันว่า Cloud process ยังทำงานอยู่ตลอดเวลา ผู้ตรวจควรตรวจ URL/สถานะ server เมื่อเปิดงาน
- รอบปรับ UI ใช้ mock เพื่อไม่เปลี่ยนข้อมูล Cloud และไม่ได้ทดสอบ CRUD/persistence กับ DB จริงเพิ่ม
- ยังไม่ได้ตรวจบนโทรศัพท์จริง; web/Android bundle สำเร็จไม่ทดแทน native-device verification
- Repository ไม่มี `.env` จริงหรือ credentials ต้องตั้งค่าจาก `.env.example` ก่อนเริ่ม backend

ลำดับตรวจรับจริงและวิธีติดตั้งอยู่ใน [README.md](README.md)
