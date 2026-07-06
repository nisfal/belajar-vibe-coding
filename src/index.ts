import { Elysia } from "elysia";
import { env } from "./env";
import { usersRoute } from "./routes/users-route";

const app = new Elysia()
  .get("/", () => ({
    message: "Welcome to Elysia + Drizzle + MySQL API",
  }))
  .use(usersRoute)
  .listen(env.PORT);

console.log(
  `🚀 Server is running at http://${app.server?.hostname}:${app.server?.port}`
);
