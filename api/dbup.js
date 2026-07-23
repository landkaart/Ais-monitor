import { db } from "../lib/db.js";


async function createWeatherHistory(){

    try {
			
			

        await db.execute({

            sql: `
            CREATE TABLE IF NOT EXISTS weather_history (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                mmsi TEXT,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                pressure REAL,

                wind_speed REAL,

                wind_bft INTEGER,

                temperature REAL

            );
            `,

            args: []

        });


        console.log(
            "weather_history tabel aangemaakt"
        );


    }
    catch(error){

        console.error(
            "Database fout:",
            error
        );

    }

}


createWeatherHistory();