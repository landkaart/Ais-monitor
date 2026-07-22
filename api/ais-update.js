import { db } from "../lib/db.js";
import { distance } from "../lib/distance.js";
import { sendTelegram } from "../lib/telegram.js";

export default async function handler(req, res) {
  try {
		
		
		if (

      req.headers.authorization !==

      `Bearer ${process.env.CRON_SECRET}`

    ) {

      return res.status(401).json({

        error:"Unauthorized"
				
			});
			
		}
		
		
		
		
		
		
    const mmsi = process.env.MMSI;

    const url =
      `https://api.marinesia.com/api/v1/vessel/${mmsi}/location/latest?key=${process.env.MARINESIA_KEY}`;

    const response = await fetch(url);
    const json = await response.json();

    if (!json.data) {
      return res.status(404).json({ error: "Geen AIS data" });
    }

    const vessel = json.data;

    const lat = Number(vessel.lat);
    const lng = Number(vessel.lng);
    const speed = Number(vessel.sog || 0);

    // vorige positie ophalen
    const previous = await db.execute({
      sql: `
        SELECT *
        FROM positions
        WHERE mmsi=?
        ORDER BY id DESC
        LIMIT 1
      `,
      args: [mmsi],
    });

    let moved = 0;

    if (previous.rows.length) {
      moved = distance(
        previous.rows[0].latitude,
        previous.rows[0].longitude,
        lat,
        lng
      );
    }

    // nieuwe positie opslaan
    await db.execute({
      sql: `
        INSERT INTO positions (mmsi, latitude, longitude, speed)
        VALUES (?, ?, ?, ?)
      `,
      args: [mmsi, lat, lng, speed],
    });

    // Telegram alarm bij beweging
    if (moved > 100) {
      const maps = `https://www.google.com/maps?q=${lat},${lng}`;

      const message = `🚢 AIS BEWEGING

MMSI: ${mmsi}
Afstand: ${Math.round(moved)} meter
Snelheid: ${speed} knopen

Positie:
${lat}, ${lng}

Google Maps:
${maps}`;

      await sendTelegram(message);
    }

    return res.json({
      ok: true,
      moved: Math.round(moved),
      latitude: lat,
      longitude: lng,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}