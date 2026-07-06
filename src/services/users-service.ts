import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export class UsersService {
  /**
   * Registrasi user baru
   * Mengembalikan true jika sukses, melempar error jika email sudah terdaftar.
   */
  static async register(data: typeof users.$inferInsert) {
    // 1. Pengecekan apakah email sudah terdaftar
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("Email sudah terdaftar");
    }

    // 2. Hashing password menggunakan Bun.password (bcrypt)
    const hashedPassword = await Bun.password.hash(data.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    // 3. Simpan data user baru ke database
    await db.insert(users).values({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    return { success: true };
  }
}
