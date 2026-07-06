import { describe, test, expect, beforeEach } from "bun:test";
import { Elysia } from "elysia";
import { usersRoute } from "../src/routes/users-route";
import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";

const app = new Elysia().use(usersRoute);

beforeEach(async () => {
  // Hapus semua data sesi dan user untuk memastikan isolasi antar skenario pengujian
  await db.delete(sessions);
  await db.delete(users);
});

describe("Users API Tests", () => {
  describe("POST /api/users (Registration)", () => {
    test("Success - Register user with valid data", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test User",
            email: "test@localhost",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ data: "OK" });
    });

    test("Fail - Duplicate email", async () => {
      // Registrasi pertama
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test User",
            email: "test@localhost",
            password: "password123",
          }),
        })
      );

      // Registrasi kedua dengan email yang sama
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Another User",
            email: "test@localhost",
            password: "password456",
          }),
        })
      );
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Email sudah terdaftar");
    });

    test("Fail - Name too long (>255 characters)", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "A".repeat(300),
            email: "test@localhost",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(422); // Elysia validation error
      const body = await response.json();
      expect(body.type).toBe("validation");
    });

    test("Fail - Missing fields", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test User",
          }),
        })
      );
      expect(response.status).toBe(422);
    });
  });

  describe("POST /api/users/login", () => {
    beforeEach(async () => {
      // Daftarkan pengguna terlebih dahulu untuk pengujian login
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test User",
            email: "test@localhost",
            password: "password123",
          }),
        })
      );
    });

    test("Success - Login with correct credentials", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@localhost",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toBeDefined();
      expect(typeof body.data).toBe("string"); // token UUID
    });

    test("Fail - Incorrect password", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@localhost",
            password: "wrongpassword",
          }),
        })
      );
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe("Email atau password salah");
    });

    test("Fail - Email not registered", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "nonexistent@localhost",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe("Email atau password salah");
    });

    test("Fail - Payload validation (too long email)", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "A".repeat(300) + "@localhost",
            password: "password123",
          }),
        })
      );
      expect(response.status).toBe(422);
    });
  });

  describe("GET /api/users/current", () => {
    let token: string;

    beforeEach(async () => {
      // Registrasi dan login untuk mendapatkan token sesi yang valid
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test User",
            email: "test@localhost",
            password: "password123",
          }),
        })
      );

      const loginRes = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@localhost",
            password: "password123",
          }),
        })
      );
      const loginBody = await loginRes.json();
      token = loginBody.data;
    });

    test("Success - Fetch current user", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toBeDefined();
      expect(body.data.name).toBe("Test User");
      expect(body.data.email).toBe("test@localhost");
      expect(body.data.id).toBeDefined();
      expect(body.data.created_at).toBeDefined();
    });

    test("Fail - No Authorization header", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
        })
      );
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
    });

    test("Fail - Invalid Authorization header format", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: `Basic ${token}`,
          },
        })
      );
      expect(response.status).toBe(401);
    });

    test("Fail - Non-existent token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: "Bearer f8a994cb-59b2-4d2d-be55-901768800d9b",
          },
        })
      );
      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/users/logout", () => {
    let token: string;

    beforeEach(async () => {
      // Registrasi dan login untuk mendapatkan token
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test User",
            email: "test@localhost",
            password: "password123",
          }),
        })
      );

      const loginRes = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@localhost",
            password: "password123",
          }),
        })
      );
      const loginBody = await loginRes.json();
      token = loginBody.data;
    });

    test("Success - Logout and verify session deleted", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toBe("OK");

      // Cek apakah token masih bisa digunakan untuk mengambil data pengguna (seharusnya gagal 401)
      const fetchResponse = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
      expect(fetchResponse.status).toBe(401);
    });

    test("Fail - Logout with non-existent token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            Authorization: "Bearer f8a994cb-59b2-4d2d-be55-901768800d9b",
          },
        })
      );
      expect(response.status).toBe(401);
    });

    test("Fail - Logout without token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
        })
      );
      expect(response.status).toBe(401);
    });
  });
});
