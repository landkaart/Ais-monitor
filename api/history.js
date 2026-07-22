import { db } from "../lib/db.js";

export default async function handler(req, res) {
  const result = await db.execute({
    sql: `
      SELECT latitude, longitude, created_at
      FROM positions
      ORDER BY id DESC
      LIMIT 200
    `,
  });

  res.json(result.rows.reverse());
}