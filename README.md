# belajar-vibe-coding (Elysia + Drizzle + MySQL REST API)

Sebuah REST API template menggunakan **Bun** runtime, **ElysiaJS** web framework, dan **Drizzle ORM** dengan database **MySQL**.

## Persyaratan
- [Bun](https://bun.sh/) (minimal v1.0.0)
- Instance **MySQL** database

## Setup Proyek

1. **Install Dependencies**
   ```bash
   bun install
   ```

2. **Konfigurasi Environment**
   Salin `.env.example` menjadi `.env` dan sesuaikan kredensial database Anda:
   ```bash
   cp .env.example .env
   ```
   Isi file `.env`:
   ```env
   PORT=3000
   DATABASE_URL=mysql://<username>:<password>@<host>:<port>/<database_name>
   ```

3. **Database Migration**
   Generate file migrasi menggunakan schema yang didefinisikan di `src/db/schema.ts`:
   ```bash
   bun run db:generate
   ```
   Jalankan migrasi ke database MySQL Anda:
   ```bash
   bun run db:migrate
   ```

4. **Menjalankan Dev Server**
   ```bash
   bun run dev
   ```
   Server akan berjalan secara otomatis di [http://localhost:3000](http://localhost:3000).

---

## API Endpoints

### User Resource (`/users`)

| Method | Endpoint | Description | Body Schema |
|---|---|---|---|
| **GET** | `/users` | Mengambil seluruh user | *None* |
| **GET** | `/users/:id` | Mengambil user spesifik berdasarkan ID | *None* |
| **POST** | `/users` | Membuat user baru | `{ "name": "string", "email": "email" }` |
| **PUT** | `/users/:id` | Memperbarui data user | `{ "name"?: "string", "email"?: "email" }` |
| **DELETE** | `/users/:id` | Menghapus user berdasarkan ID | *None* |

---

## Perintah Penting (Scripts)

- `bun run dev` — Menjalankan server dalam mode development dengan watch mode/hot reload.
- `bun run db:generate` — Menghasilkan file SQL migrasi di folder `drizzle/`.
- `bun run db:migrate` — Menjalankan file migrasi untuk memperbarui database MySQL.
- `bun run db:studio` — Menjalankan Drizzle Studio (database client berbasis web).
