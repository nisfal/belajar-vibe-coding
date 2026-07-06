const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is required.");
  process.exit(1);
}

export const env = {
  PORT,
  DATABASE_URL,
};
