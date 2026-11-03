# AURA STUDIO — Minimal & Everyday Wear

เว็บไซต์ร้านเสื้อผ้าออนไลน์สไตล์ **Minimal & Everyday Wear** ในโทนสี **Warm Sand & Oatmeal** เน้นความเรียบง่าย สบายตา สวมใส่ได้จริงทุกวัน พร้อมระบบร้านค้าออนไลน์ครบวงจร

## ✨ จุดเด่นของเว็บไซต์

- **Aesthetic Direction:** สไตล์มินิมอลร่วมสมัย คุมโทน Sand, Oatmeal, Linen และ Espresso (#FAF7F2, #EFE8DE, #8C7355, #2B2623)
- **Product Catalog & Filters:** กรองสินค้าตามหมวดหมู่ (Tops, Bottoms, Outerwear, Dresses, Accessories) ค้นหาชื่อสินค้า และเรียงตามราคา/ความนิยม
- **Interactive Quick View:** ดูรายละเอียดเนื้อผ้า คำแนะนำการซัก สัดส่วน และเลือกไซส์/สีก่อนสั่งซื้อ
- **Smart Cart Drawer:** ตะกร้าสินค้าด้านข้างพร้อมคำนวณราคาสด ปรับเพิ่ม-ลดจำนวนสินค้า ใส่โค้ดส่วนลด และคำนวณเงื่อนไขส่งฟรีอัตโนมัติ (เมื่อครบ ฿1,500)
- **Checkout Simulation:** แบบฟอร์มสั่งซื้อพร้อมสร้าง Order ID และรองรับการจำลองชำระเงิน (PromptPay, Credit Card, Bank Transfer)
- **Automated CI/CD Tests:** ทดสอบตรรกะการคำนวณราคา ตะกร้าสินค้า และความถูกต้องของข้อมูลแคตตาล็อกผ่าน GitHub Actions

## 📂 โครงสร้างโปรเจกต์

```text
├── .github/workflows/test.yml   # ระบบ GitHub Actions CI รันทดสอบอัตโนมัติ
├── css/
│   └── styles.css               # สไตล์ชีทโทน Warm Sand & Oatmeal พร้อม responsive design
├── js/
│   ├── products.js              # ฐานข้อมูลสินค้า คอลเลกชัน และฟังก์ชันค้นหา
│   ├── cartLogic.js             # ตรรกะคำนวณตะกร้าสินค้า ส่วนลด ค่าจัดส่ง (Pure ESM)
│   └── app.js                   # ตัวควบคุม UI, Modal, Cart Drawer และ Event Handlers
├── tests/
│   └── cart.test.js             # Automated Unit Tests ด้วย node:test
├── index.html                   # โครงสร้างหน้าเว็บหลักของร้าน AURA STUDIO
├── package.json
└── README.md
```

## 🚀 วิธีการทดสอบและเปิดใช้งาน

1. โคลนคลังโค้ดนี้:
   ```bash
   git clone https://github.com/tmogvip-hub/pia-test-clothing-store-20261103.git
   cd pia-test-clothing-store-20261103
   ```
2. รัน Automated Test Suite:
   ```bash
   npm test
   ```
3. เปิดหน้าเว็บไซต์:
   เปิดไฟล์ `index.html` บนเว็บเบราว์เซอร์ หรือรันผ่าน Live Server เช่น:
   ```bash
   npx serve .
   ```
