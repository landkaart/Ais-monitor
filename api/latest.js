import { db } from "../lib/db.js";

export default async function handler(req, res) {
  const result = await db.execute({
    sql: `
      SELECT *
      FROM positions
      ORDER BY id DESC
      LIMIT 1
    `,
  });

  res.json(result.rows[0] || {});
}