import { db } from "../lib/db.js";

export default async function handler(req,res){

const result =
await db.execute(`
SELECT COUNT(*) as aantal
FROM positions
`);

res.json(result.rows);

}