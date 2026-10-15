import { ensureCatalog } from "../src/server/services/catalog";
import { client } from "../src/server/db";
await ensureCatalog();
console.log("Seeded 5 tracks and 10 lessons. No demo progress was added.");
client.close();
