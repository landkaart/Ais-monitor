import { createClient } from "@libsql/

console.log({
  url: process.env.TURSO_DATABASE_URL,
  token: !!process.env.TURSO_AUTH_TOKEN
});



export const db = createClient({

 url: process.env.TURSO_DATABASE_URL,

 authToken: process.env.TURSO_AUTH_TOKEN

});
