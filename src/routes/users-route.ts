import { Elysia, t } from "elysia";
import { UsersService } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api/users" })
  .post(
    "/",
    async ({ body, set }) => {
      try {
        await UsersService.register({
          name: body.name,
          email: body.email,
          password: body.password,
        });

        // Response Body (Success): { "data": "OK" }
        return {
          data: "OK",
        };
      } catch (err: any) {
        if (err.message === "Email sudah terdaftar") {
          set.status = 400;
          return {
            error: "Email sudah terdaftar",
          };
        }

        set.status = 500;
        return {
          error: err.message || "Internal Server Error",
        };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String({ minLength: 3 }),
        password: t.String({ minLength: 1 }),
      }),
    }
  )
  .post(
    "/login",
    async ({ body, set }) => {
      try {
        const token = await UsersService.login({
          email: body.email,
          password: body.password,
        });

        return {
          data: token,
        };
      } catch (err: any) {
        if (err.message === "Email atau password salah") {
          set.status = 401;
          return {
            error: "Email atau password salah",
          };
        }

        set.status = 500;
        return {
          error: err.message || "Internal Server Error",
        };
      }
    },
    {
      body: t.Object({
        email: t.String({ minLength: 3 }),
        password: t.String({ minLength: 1 }),
      }),
    }
  )
  .get(
    "/current",
    async ({ headers, set }) => {
      try {
        const authorization = headers["authorization"];
        if (!authorization || !authorization.startsWith("Bearer ")) {
          set.status = 401;
          return {
            error: "Unauthorized",
          };
        }

        const token = authorization.substring(7); // Hapus "Bearer "
        const user = await UsersService.getCurrentUser(token);

        return {
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.createdAt,
          },
        };
      } catch (err: any) {
        if (err.message === "Unauthorized") {
          set.status = 401;
          return {
            error: "Unauthorized",
          };
        }

        set.status = 500;
        return {
          error: err.message || "Internal Server Error",
        };
      }
    }
  )
  .delete(
    "/logout",
    async ({ headers, set }) => {
      try {
        const authorization = headers["authorization"];
        if (!authorization || !authorization.startsWith("Bearer ")) {
          set.status = 401;
          return {
            error: "Unauthorized",
          };
        }

        const token = authorization.substring(7); // Hapus "Bearer "
        await UsersService.logout(token);

        return {
          data: "OK",
        };
      } catch (err: any) {
        if (err.message === "Unauthorized") {
          set.status = 401;
          return {
            error: "Unauthorized",
          };
        }

        set.status = 500;
        return {
          error: err.message || "Internal Server Error",
        };
      }
    }
  );

