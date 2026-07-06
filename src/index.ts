import { Elysia } from "elysia";
import { env } from "./env";
import { userRoutes } from "./routes/users";

const app = new Elysia()
  .get("/", () => ({
    message: "Welcome to Elysia + Drizzle + MySQL API",
    docs: "/users",
  }))
  .use(userRoutes)
  .listen(env.PORT);

console.log(
  `🚀 Server is running at http://${app.server?.hostname}:${app.server?.port}`
);
