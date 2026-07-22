import { db } from "../lib/db.js";


export default async function handler(req, res) {


	const result =
		await db.execute({

			sql: `
            SELECT
                id,
                mmsi,
                latitude,
                longitude,
                speed,
                created_at
            FROM positions
            ORDER BY id DESC
            LIMIT 200
            `,

			args: []

		});


	res.setHeader(
		"Content-Type",
		"application/json"
	);


	res.status(200)
		.json(result.rows);

}