# Belajar Vibe Coding (Elysia + Drizzle + MySQL REST API)

Sebuah REST API template terstruktur yang menggunakan **Bun** runtime, **ElysiaJS** web framework, dan **Drizzle ORM** dengan database **MySQL**. Proyek ini menerapkan pembagian tanggung jawab kode (*separation of concerns*) yang jelas antara routing dan logika bisnis.

---

## 🛠️ Technology Stack & Libraries

- **Runtime**: [Bun](https://bun.sh/) (v1.x) - Executable engine dan package manager berkecepatan tinggi.
- **Web Framework**: [ElysiaJS](https://elysiajs.com/) - Web framework berkinerja tinggi, ramah TypeScript, dan ringan.
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - ORM berbasis TypeScript bertipe data ketat yang cepat dan efisien.
- **Database Driver**: `mysql2` - Driver database MySQL untuk Node.js/Bun.
- **Autentikasi & Keamanan**:
  - Hashing password menggunakan Bun native API (`Bun.password` dengan algoritma bcrypt).
  - Manajemen sesi berbasis token UUID unik.

---

## 📂 Struktur Folder & Arsitektur

Proyek ini menggunakan arsitektur berlapis yang memisahkan antara layer routing, logika bisnis, dan basis data:

```text
├── .agents/               # Aturan/Rule otomatisasi agen pengembangan
├── drizzle/               # SQL Migrations yang dihasilkan oleh Drizzle Kit
├── src/
│   ├── db/
│   │   ├── index.ts       # Inisialisasi koneksi basis data & Drizzle instance
│   │   └── schema.ts      # Definisi tabel (skema) database
│   ├── routes/
│   │   └── users-route.ts # Layer routing/API endpoint ElysiaJS
│   ├── services/
│   │   └── users-service.ts # Layer Logika Bisnis & Query Database
│   ├── env.ts             # Manajemen variabel environment
│   └── index.ts           # Entry point utama aplikasi
├── tests/
│   └── users.test.ts      # Unit tests endpoint menggunakan Bun Test
├── .env.example           # Contoh konfigurasi environment
├── issue.md               # Dokumen perencanaan pengerjaan fitur/bug
├── package.json
└── README.md
```

### Konvensi Penamaan & Struktur Berkas
- **Routes (`src/routes/`)**: Menggunakan format kebab-case diakhiri dengan `-route.ts` (contoh: `users-route.ts`). Hanya menangani parsing request, validasi skema payload, pemanggilan service, dan format HTTP response.
- **Services (`src/services/`)**: Menggunakan format kebab-case diakhiri dengan `-service.ts` (contoh: `users-service.ts`). Berisi logika bisnis aplikasi, interaksi data melalui ORM Drizzle, pengecekan validitas, enkripsi, dan pelemparan error.

---

## 🗄️ Skema Database

Sistem database terdiri dari dua tabel utama dengan relasi satu-ke-banyak (*one-to-many*) dari tabel `users` ke `sessions`.

```mermaid
erDiagram
    users {
        bigint_unsigned id PK
        varchar_255 name
        varchar_255 email UK
        varchar_255 password
        timestamp created_at
    }
    sessions {
        varchar_255 token PK "UUID"
        bigint_unsigned user_id FK
        timestamp created_at
    }
    users ||--o{ sessions : "has"
```

### 1. Tabel `users`
Menyimpan data akun pengguna.
- `id` (`bigint unsigned`, Primary Key, Auto Increment)
- `name` (`varchar(255)`, Not Null)
- `email` (`varchar(255)`, Unique, Not Null)
- `password` (`varchar(255)`, Not Null - disimpan dalam bentuk Bcrypt Hash)
- `created_at` (`timestamp`, Default `CURRENT_TIMESTAMP`)

### 2. Tabel `sessions`
Menyimpan token sesi aktif untuk autentikasi Bearer Token.
- `token` (`varchar(255)`, Primary Key - diisi dengan string UUID unik)
- `user_id` (`bigint unsigned`, Foreign Key merujuk ke `users.id` dengan ON DELETE CASCADE)
- `created_at` (`timestamp`, Default `CURRENT_TIMESTAMP`)

---

## 🚀 API Endpoints

Seluruh rute memiliki prefix `/api/users`.

### 1. Registrasi User Baru
Mendaftarkan akun user baru dengan enkripsi password otomatis.
- **Method / Path**: `POST /api/users`
- **Request Body (JSON)**:
  ```json
  {
    "name": "Eko",
    "email": "eko@localhost",
    "password": "rahasia"
  }
  ```
- **Response (Success - 200)**:
  ```json
  {
    "data": "OK"
  }
  ```
- **Response (Gagal - 400 Email Duplikat)**:
  ```json
  {
    "error": "Email sudah terdaftar"
  }
  ```
- **Response (Gagal - 422 Skema Tidak Valid)**:
  Format salah atau melebihi 255 karakter.

---

### 2. Login User
Melakukan autentikasi dan menghasilkan token sesi berupa UUID.
- **Method / Path**: `POST /api/users/login`
- **Request Body (JSON)**:
  ```json
  {
    "email": "eko@localhost",
    "password": "rahasia"
  }
  ```
- **Response (Success - 200)**:
  ```json
  {
    "data": "session-uuid-token-here"
  }
  ```
- **Response (Gagal - 401 Salah Kredensial)**:
  ```json
  {
    "error": "Email atau password salah"
  }
  ```

---

### 3. Get Current User
Mengambil data detail akun user yang sedang masuk/login.
- **Method / Path**: `GET /api/users/current`
- **Headers**:
  - `Authorization: Bearer <session-uuid-token>`
- **Response (Success - 200)**:
  ```json
  {
    "data": {
      "id": 1,
      "name": "Eko",
      "email": "eko@localhost",
      "created_at": "2026-07-06T08:00:00.000Z"
    }
  }
  ```
- **Response (Gagal - 401 Unauthorized)**:
  ```json
  {
    "error": "Unauthorized"
  }
  ```

---

### 4. Logout User
Menghapus sesi token dari database sehingga token tersebut tidak dapat digunakan kembali.
- **Method / Path**: `DELETE /api/users/logout`
- **Headers**:
  - `Authorization: Bearer <session-uuid-token>`
- **Response (Success - 200)**:
  ```json
  {
    "data": "OK"
  }
  ```
- **Response (Gagal - 401 Unauthorized)**:
  ```json
  {
    "error": "Unauthorized"
  }
  ```

---

## 🛠️ Cara Setup & Instalasi Project

### 1. Persyaratan Sistem
Pastikan Anda sudah menginstal [Bun](https://bun.sh/) secara global di sistem operasi Anda dan memiliki akses ke database MySQL.

### 2. Install Dependencies
```bash
bun install
```

### 3. Konfigurasi Environment File
Salin file `.env.example` menjadi `.env` dan sesuaikan koneksi database Anda:
```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux/macOS
cp .env.example .env
```
Isi dari `.env`:
```env
PORT=3000
DATABASE_URL=mysql://root:password@localhost:3306/belajar_vibe_coding
```

### 4. Migrasi Database
Buat skema tabel dan sinkronisasikan Drizzle schema ke database MySQL Anda:
```bash
# Generate file SQL migrasi di folder drizzle/
bun run db:generate

# Eksekusi migrasi ke MySQL
bun run db:migrate
```

---

## 🏃‍♂️ Menjalankan Aplikasi

Menjalankan dev server dengan hot reload otomatis menggunakan Bun:
```bash
bun run dev
```
Aplikasi akan aktif dan berjalan di [http://localhost:3000](http://localhost:3000).

---

## 🧪 Cara Menjalankan Unit Test

Pengujian API menggunakan *in-memory* test runner bawaan Bun:
```bash
bun test tests/users.test.ts
```
> [!NOTE]  
> Setiap kali pengujian dijalankan, data pada tabel `users` dan `sessions` akan dibersihkan terlebih dahulu melalui hook `beforeEach` untuk menjamin konsistensi data pengujian.
