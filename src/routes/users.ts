import { Elysia, t } from "elysia";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const userRoutes = new Elysia({ prefix: "/users" })
  .get("/", async () => {
    try {
      const allUsers = await db.select().from(users);
      return allUsers;
    } catch (err: any) {
      return { error: err.message };
    }
  })
  .get("/:id", async ({ params: { id }, set }) => {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      if (result.length === 0) {
        set.status = 404;
        return { message: "User not found" };
      }
      return result[0];
    } catch (err: any) {
      set.status = 500;
      return { error: err.message };
    }
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
  })
  .post("/", async ({ body, set }) => {
    try {
      await db.insert(users).values({
        name: body.name,
        email: body.email,
      });
      set.status = 201;
      return { message: "User created successfully" };
    } catch (err: any) {
      set.status = 500;
      return { error: err.message };
    }
  }, {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      email: t.String({ format: "email" }),
    }),
  })
  .put("/:id", async ({ params: { id }, body, set }) => {
    try {
      const updateData: Partial<typeof users.$inferInsert> = {};
      if (body.name) updateData.name = body.name;
      if (body.email) updateData.email = body.email;

      if (Object.keys(updateData).length === 0) {
        set.status = 400;
        return { message: "No fields to update" };
      }

      await db.update(users).set(updateData).where(eq(users.id, id));
      return { message: "User updated successfully" };
    } catch (err: any) {
      set.status = 500;
      return { error: err.message };
    }
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
    body: t.Object({
      name: t.Optional(t.String({ minLength: 1 })),
      email: t.Optional(t.String({ format: "email" })),
    }),
  })
  .delete("/:id", async ({ params: { id }, set }) => {
    try {
      await db.delete(users).where(eq(users.id, id));
      return { message: "User deleted successfully" };
    } catch (err: any) {
      set.status = 500;
      return { error: err.message };
    }
  }, {
    params: t.Object({
      id: t.Numeric(),
    }),
  });
