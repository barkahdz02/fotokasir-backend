\# API Endpoints — FotoKasir



\*\*Base URL:\*\* `http://localhost:3000/api/v1`

\*\*Auth:\*\* Bearer JWT

\*\*Total Endpoint:\*\* 64



\---



\## AUTH (3)



| Method | Endpoint | Auth | Fungsi |

|---|---|---|---|

| POST | /auth/login | Public | Login |

| POST | /auth/switch-role | 🔒 | Ganti role |

| GET | /auth/me | 🔒 | Profil |



\---



\## USERS (7) — Admin only



| Method | Endpoint |

|---|---|

| GET | /users |

| POST | /users |

| GET | /users/:id |

| PUT | /users/:id |

| DELETE | /users/:id |

| POST | /users/:id/roles |

| GET | /users/:id/roles |



\---



\## ROLES (8) — Admin only



| Method | Endpoint |

|---|---|

| GET | /roles |

| POST | /roles |

| GET | /roles/permissions |

| GET | /roles/:id |

| PUT | /roles/:id |

| DELETE | /roles/:id |

| GET | /roles/:id/permissions |

| PUT | /roles/:id/permissions |



\---



\## CATEGORIES (5)



GET/POST /categories

GET/PUT/DELETE /categories/:id



\---



\## UNITS (5)



GET/POST /units

GET/PUT/DELETE /units/:id



\---



\## PRODUCTS (7)



| Method | Endpoint | Keterangan |

|---|---|---|

| GET | /products | Support query: search, category\_id, tipe |

| POST | /products | - |

| GET | /products/low-stock | Stok di bawah minimum |

| GET | /products/barcode/:barcode | Cari by barcode |

| GET | /products/:id | - |

| PUT | /products/:id | - |

| DELETE | /products/:id | Soft delete |



\---



\## SERVICE TYPES (12)



| Method | Endpoint |

|---|---|

| GET | /service-types |

| POST | /service-types |

| GET | /service-types/:id |

| PUT | /service-types/:id |

| DELETE | /service-types/:id |

| GET | /service-attributes |

| POST | /service-attributes |

| DELETE | /service-attributes/:id |

| GET | /service-types/:id/prices |

| POST | /service-types/:id/prices |

| DELETE | /service-prices/:id |

| POST | /service-types/:id/lookup |



\---



\## CASH SESSIONS (4)



| Method | Endpoint |

|---|---|

| GET | /cash-sessions/active |

| GET | /cash-sessions |

| POST | /cash-sessions/open |

| POST | /cash-sessions/close |



\---



\## TRANSACTIONS (3)



| Method | Endpoint |

|---|---|

| GET | /transactions |

| GET | /transactions/:id |

| POST | /transactions |



\---



\## INVENTORY (5)



| Method | Endpoint |

|---|---|

| POST | /inventory/stock-in |

| POST | /inventory/adjust |

| GET | /inventory/movements |

| GET | /inventory/purchases |

| GET | /inventory/purchases/:id |



\---



\## REPORTS (5)



| Method | Endpoint | Query |

|---|---|---|

| GET | /reports/dashboard | - |

| GET | /reports/penjualan | ?periode=hari/minggu/bulan |

| GET | /reports/laba-rugi | ?periode=bulan |

| GET | /reports/top-products | ?periode=bulan\&limit=10 |

| GET | /reports/stok | - |



\---



\## CONTOH REQUEST



\### Login

```json

POST /api/v1/auth/login

{

&#x20; "username": "admin",

&#x20; "password": "admin123"

}



POST /api/v1/transactions

{

&#x20; "items": \[

&#x20;   {

&#x20;     "tipe": "jasa",

&#x20;     "nama\_snapshot": "Fotocopy A4 HP 1 Sisi",

&#x20;     "qty": 10,

&#x20;     "satuan": "lembar",

&#x20;     "qty\_dasar": 10,

&#x20;     "harga\_satuan": 200,

&#x20;     "subtotal": 2000,

&#x20;     "detail\_jasa": { "ukuran": "A4", "warna": "hitam\_putih" }

&#x20;   }

&#x20; ],

&#x20; "diskon\_total": 0,

&#x20; "metode\_bayar": "tunai",

&#x20; "bayar": 50000

}



POST /api/v1/service-types/1/prices

{

&#x20; "kombinasi": { "ukuran": "A4", "warna": "hitam\_putih", "sisi": "1\_sisi" },

&#x20; "harga": 200

}



POST /api/v1/inventory/stock-in

{

&#x20; "supplier\_nama": "PT Sinar Jaya",

&#x20; "items": \[

&#x20;   { "product\_id": 1, "qty": 5, "satuan": "rim", "harga\_beli": 45000 }

&#x20; ]

}

