import * as process from "node:process";
import "dotenv/config";
import { setupApp } from "./app";

const PORT = process.env.PORT ?? 3000;

main();

async function main() {
  const app = await setupApp();

  app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
  });
}
