import { createClient } from "@libsql/client";


console.log("DATABASE URL aanwezig:", !!process.env.TURSO_DATABASE_URL);
console.log("TOKEN aanwezig:", !!process.env.TURSO_AUTH_TOKEN);


export const db = createClient({

 url: process.env.TURSO_DATABASE_URL,

 authToken: process.env.TURSO_AUTH_TOKEN

});
