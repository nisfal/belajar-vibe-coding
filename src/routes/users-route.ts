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
  );
