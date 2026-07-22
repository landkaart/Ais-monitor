import { db } from "../lib/db.js";


async function updateDatabase() {

    console.log("Database update gestart...");


    // status toevoegen aan positions
    try {

        await db.execute(`
            ALTER TABLE positions
            ADD COLUMN status TEXT
        `);

        console.log(
            "Kolom status toegevoegd aan positions"
        );

    }
    catch(error){

        console.log(
            "status bestaat waarschijnlijk al"
        );

    }



    // nieuwe tabel voor schipstatus
    await db.execute(`

        CREATE TABLE IF NOT EXISTS vessel_state (

            mmsi TEXT PRIMARY KEY,

            status TEXT,

            anchor_lat REAL,

            anchor_lng REAL,

            last_alarm DATETIME

        )

    `);


    console.log(
        "Tabel vessel_state aanwezig"
    );


    console.log(
        "Database update klaar"
    );

}


updateDatabase();