import { db } from "../lib/db.js";


export default async function handler(req, res) {


	res.setHeader(
		"Content-Type",
		"text/event-stream"
	);


	res.setHeader(
		"Cache-Control",
		"no-cache"
	);


	res.setHeader(
		"Connection",
		"keep-alive"
	);



	let lastId = 0;



	const timer =
		setInterval(async () => {


			const result =
				await db.execute({

					sql: `
            SELECT *
            FROM positions
            WHERE id > ?
            ORDER BY id
            `,

					args: [
						lastId
					]

				});



			for (
				const row of result.rows
			) {

				lastId =
					row.id;


				res.write(

					`data: ${JSON.stringify(row)}\n\n`

				);

			}


		}, 10000);



	req.on(
		"close",
		() => {

			clearInterval(timer);

		}
	);

}