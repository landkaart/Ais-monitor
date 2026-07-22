import { db } from "../lib/db.js";


// Haversine afstand in meters
function distance(lat1, lon1, lat2, lon2) {

    const R = 6371000;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );
}


// Telegram
async function sendTelegram(message) {

    if (!process.env.TELEGRAM_TOKEN) {
        console.log(message);
        return;
    }

    try {

        await fetch(
            `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    chat_id:process.env.TELEGRAM_CHAT,
                    text:message
                })
            }
        );

    } catch(error){

        console.error(
            "Telegram fout:",
            error.message
        );

    }
}



export default async function handler(req,res){

    const mmsi = process.env.MMSI;


    if(!mmsi){
        return res.status(500).json({
            error:"MMSI ontbreekt"
        });
    }



    const url =
    `https://api.marinesia.com/api/v1/vessel/${mmsi}/location/latest?key=${process.env.MARINESIA_KEY}`;


    let json;


    try {

        const response = await fetch(url);


        if(response.status === 429){

            return res.status(429).json({
                error:"Marinesia rate limit bereikt"
            });

        }


        if(!response.ok){

            return res.status(500).json({
                error:"Marinesia API fout",
                status:response.status
            });

        }


        json = await response.json();


    } catch(error){

        return res.status(500).json({
            error:"AIS ophalen mislukt"
        });

    }



    if(!json.data){

        return res.status(404).json({
            error:"Geen AIS positie"
        });

    }



    const vessel = json.data;


    const latitude =
        Number(vessel.lat);


    const longitude =
        Number(vessel.lng);


    const speed =
        Number(vessel.sog || 0);



    // vorige positie

    const previous =
    await db.execute({

        sql:
        `
        SELECT latitude,longitude
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


    if(previous.rows.length){

        moved =
        distance(

            Number(previous.rows[0].latitude),

            Number(previous.rows[0].longitude),

            latitude,

            longitude
        );

    }



    // Alleen opslaan als:
    // - eerste positie
    // - of beweging > 10 meter

    if(
        previous.rows.length === 0 ||
        moved > 10
    ){

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
            VALUES (?,?,?,?)
            `,

            args:[
                mmsi,
                latitude,
                longitude,
                speed
            ]

        });

    }



    // Alarm

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

        longitude,

        speed

    });

}