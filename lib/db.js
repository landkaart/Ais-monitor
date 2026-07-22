import { createClient } from "@libsql/client";

console.log({
  url: process.env.TURSO_DATABASE_URL,
  token: process.env.TURSO_AUTH_TOKEN,
	ais: process.env.MARINESIA_KEY
});



export const db = createClient({

 url: process.env.TURSO_DATABASE_URL,

 authToken: process.env.TURSO_AUTH_TOKEN

});
