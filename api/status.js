import { db } from "../lib/db.js";
import { getMarineContext } from "./seaAreaService.js";


function kmhToBeaufort(kmh = 0) {

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



function degreesToCompass(deg = 0) {

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



export default async function handler(req,res) {

    try {


        const mmsi =
            process.env.MMSI;



        const result =
            await db.execute({

                sql:`
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
						



        if(!result.rows.length){

            return res.status(404).json({

                error:"Geen AIS positie"

            });

        }



        const vessel =
            result.rows[0];



        /*
        WEATHER
        */


        let weather = {};

        try {


            const response =
                await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${vessel.latitude}&longitude=${vessel.longitude}&current=wind_speed_10m,wind_direction_10m,precipitation,temperature_2m`
                );


            weather =
                await response.json();


        }

        catch(error){

            console.error(
                "Weather:",
                error.message
            );

        }



        const current =
            weather.current || {};



        const windSpeed =
            current.wind_speed_10m || 0;


        const windDirection =
            current.wind_direction_10m || 0;



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


        const online =
            minutesAgo <= 180;



        let status =
            "STIL";


        if(!online){

            status="OFFLINE";

        }

        else if(
            vessel.status === "VAART"
        ){

            status="VAART";

        }



        /*
        SEA AREA
        */


        let marine = null;


        try {

            marine =
                getMarineContext([

                    Number(vessel.longitude),

                    Number(vessel.latitude)

                ]);

        }

        catch(error){

            console.error(
                "Marine:",
                error.message
            );

        }




        return res.json({

            mmsi:
                vessel.mmsi,


            latitude:
                vessel.latitude,


            longitude:
                vessel.longitude,


            speed:
                vessel.speed,


            status,


            online,


            last_update:
                vessel.created_at,


            minutes_ago:
                minutesAgo,



            wind_speed:
                windSpeed,


            wind_bft:
                kmhToBeaufort(
                    windSpeed
                ),


            wind_direction:
                windDirection,


            wind_compass:
                degreesToCompass(
                    windDirection
                ),


            rain:
                current.precipitation || 0,


            temperature:
                current.temperature_2m ?? null,



            area:
                marine?.[0]?.name ?? null,


            area_category:
                marine?.[0]?.category ?? null,



            google_maps:
                `https://www.google.com/maps?q=${vessel.latitude},${vessel.longitude}`


        });


    }


    catch(error){


        console.error(
            "AIS API:",
            error
        );


        return res.status(500).json({

            error:error.message

        });

    }

}