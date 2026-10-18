import { synchronizeCatalog } from "../src/server/services/catalog";
import { client } from "../src/server/db";
await synchronizeCatalog();
console.log(
  "Synchronized the course and lesson catalog. No demo progress was added.",
);
client.close();
