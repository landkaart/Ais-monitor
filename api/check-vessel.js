import { db } from "../lib/db.js";


// Afstand berekenen in meters (Haversine)
function distance(lat1, lon1, lat2, lon2) {

    const R = 6371000;

    const dLat =
        (lat2 - lat1) * Math.PI / 180;

    const dLon =
        (lon2 - lon1) * Math.PI / 180;


    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;


    return R *
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );
}


// Telegram melding
async function sendTelegram(message) {

    if (!process.env.TELEGRAM_TOKEN) {
        console.log(message);
        return;
    }


    await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                chat_id:
                process.env.TELEGRAM_CHAT,

                text: message

            })
        }
    );
}



export default async function handler(req, res) {


    const mmsi =
        process.env.MMSI;


    // Marinesia API

    const url =
    `https://api.marinesia.com/api/v2/vessel/location/latest?mmsi=${mmsi}&key=${process.env.MARINESIA_KEY}`;


    const response =
        await fetch(url);


    const json =
        await response.json();


    if (!json.data) {

        return res.status(404)
        .json({
            error:"Geen AIS positie"
        });

    }


    const vessel =
        json.data;


    const latitude =
        vessel.lat;


    const longitude =
        vessel.lng;


    const speed =
        vessel.sog || 0;



    // laatste positie ophalen

    const previous =
        await db.execute({

            sql:
            `
            SELECT *
            FROM positions
            WHERE mmsi=?
            ORDER BY id DESC
            LIMIT 1
            `,

            args:[
                mmsi
            ]

        });



    let moved = 0;



    if(previous.rows.length > 0){


        moved =
        distance(

            previous.rows[0].latitude,

            previous.rows[0].longitude,

            latitude,

            longitude

        );

    }



    // nieuwe positie opslaan

    await db.execute({

        sql:
        `
        INSERT INTO positions
        (
        mmsi,
        latitude,
        longitude,
        speed
        )
        VALUES
        (?,?,?,?)
        `,


        args:[

            mmsi,

            latitude,

            longitude,

            speed

        ]

    });



    // alarm boven 100 meter

    if(moved > 100){


        await sendTelegram(

`
🚢 AIS beweging

MMSI:
${mmsi}

Afstand:
${Math.round(moved)} meter

Positie:
${latitude},
${longitude}

Snelheid:
${speed} knopen
`

        );

    }



    return res.json({

        ok:true,

        mmsi,

        moved:Math.round(moved),

        latitude,

        longitude

    });


}