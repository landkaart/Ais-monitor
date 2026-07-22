import { createClient } from "@libsql/client";

console.log("TURSO URL:", process.env.TURSO_DATABASE_URL);

export const db = createClient({

 url: process.env.TURSO_DATABASE_URL,

 authToken: process.env.TURSO_AUTH_TOKEN

});
