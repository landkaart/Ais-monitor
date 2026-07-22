import { db } from "../lib/db.js";


export default async function handler(req, res) {

    try {


        const mmsi =
        process.env.MMSI;



        const result =
        await db.execute({

            sql: `
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



        if(result.rows.length === 0){

            return res.status(404).json({

                error:"Geen AIS positie"

            });

        }



        const vessel =
        result.rows[0];



        const lastUpdate =
        new Date(
            vessel.created_at
        );



        const minutesAgo =
        Math.round(
            (Date.now()-lastUpdate.getTime())
            /
            60000
        );



        let online = true;


        if(minutesAgo > 180){

            online=false;

        }



        let iconStatus;


        if(!online){

            iconStatus="OFFLINE";

        }
        else if(vessel.status==="VAART"){

            iconStatus="VAART";

        }
        else {

            iconStatus="STIL";

        }



        return res.json({

            mmsi:vessel.mmsi,

            latitude:vessel.latitude,

            longitude:vessel.longitude,

            speed:vessel.speed,

            status:iconStatus,

            online,

            last_update:vessel.created_at,

            minutes_ago:minutesAgo,

            google_maps:
            `https://www.google.com/maps?q=${vessel.latitude},${vessel.longitude}`

        });


    }
    catch(error){

        console.error(error);


        res.status(500).json({

            error:error.message

        });

    }

}