import "dotenv/config";

import { app } from "./app";
import { connectDatabase } from "./config/database";

const port = Number(process.env.PORT) || 3000;

async function bootstrap() {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start application", error);
  process.exit(1);
});