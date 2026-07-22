import { db } from "../lib/db.js";


function kmhToBeaufort(kmh) {

    if (kmh < 1) return 0;
    if (kmh < 6) return 1;
    if (kmh < 12) return 2;
    if (kmh < 20) return 3;
    if (kmh < 29) return 4;
    if (kmh < 39) return 5;
    if (kmh < 50) return 6;
    if (kmh < 62) return 7;
    if (kmh < 75) return 8;
    if (kmh < 89) return 9;
    if (kmh < 103) return 10;
    if (kmh < 118) return 11;

    return 12;
}


function degreesToCompass(deg) {

    const directions = [
        "N",
        "NNO",
        "NO",
        "ONO",
        "O",
        "OZO",
        "ZO",
        "ZZO",
        "Z",
        "ZZW",
        "ZW",
        "WZW",
        "W",
        "WNW",
        "NW",
        "NNW"
    ];

    return directions[
        Math.round(deg / 22.5) % 16
    ];
}



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



        /*
        WEER OPHALEN
        */

        const weatherResponse =
        await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${vessel.latitude}&longitude=${vessel.longitude}&current=wind_speed_10m,wind_direction_10m,precipitation,temperature_2m`
        );


        const weather =
        await weatherResponse.json();


        const windSpeed =
        weather.current.wind_speed_10m;


        const windDirection =
        weather.current.wind_direction_10m;


        const windBft =
        kmhToBeaufort(windSpeed);


        const windCompass =
        degreesToCompass(windDirection);


        const rain =
        weather.current.precipitation;


        const temperature =
        weather.current.temperature_2m;



        /*
        AIS STATUS
        */

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
				
				
				import { getMarineContext }
from "./seaAreaService.js";


const gps = [
  vessel.longitude,vessel.latitude
  
];


const marine =
  getMarineContext(gps);


console.log(marine);



        return res.json({

            mmsi:vessel.mmsi,

            latitude:vessel.latitude,

            longitude:vessel.longitude,

            speed:vessel.speed,

            status:iconStatus,

            online,

            last_update:vessel.created_at,

            minutes_ago:minutesAgo,


            // WEER

            wind_speed:windSpeed,

            wind_bft:windBft,

            wind_direction:windDirection,

            wind_compass:windCompass,

            rain:rain,

            temperature:temperature,
           
						area: marine.name,
e
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