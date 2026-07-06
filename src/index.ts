import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { env } from "./env";
import { usersRoute } from "./routes/users-route";

const app = new Elysia()
  .use(
    swagger({
      path: "/swagger",
      documentation: {
        info: {
          title: "Belajar Vibe Coding API",
          version: "1.0.0",
          description: "REST API Documentation with ElysiaJS and Swagger",
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "UUID",
            },
          },
        },
      },
    })
  )
  .get("/", () => ({
    message: "Welcome to Elysia + Drizzle + MySQL API",
  }))
  .use(usersRoute)
  .listen(env.PORT);

console.log(
  `🚀 Server is running at http://${app.server?.hostname}:${app.server?.port}`
);
