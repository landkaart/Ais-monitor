import { db } from "../lib/db.js";


export default async function handler(req,res){


    res.setHeader(
        "Content-Type",
        "text/event-stream"
    );

    res.setHeader(
        "Cache-Control",
        "no-cache, no-transform"
    );

    res.setHeader(
        "Connection",
        "keep-alive"
    );


    res.flushHeaders();



    let lastId = 0;


    let running = true;



    req.on(
        "close",
        () => {

            running = false;

        }
    );



    // heartbeat

    const heartbeat =
    setInterval(()=>{

        if(running){

            res.write(": ping\n\n");

        }

    },25000);




    async function stream(){


        while(running){


            try {


                const result =
                await db.execute({

                    sql:
                    `
                    SELECT *
                    FROM positions
                    WHERE id > ?
                    ORDER BY id ASC
                    `,

                    args:[
                        lastId
                    ]

                });



                for(
                    const row of result.rows
                ){

                    lastId =
                    row.id;


                    res.write(
                        `data: ${JSON.stringify(row)}\n\n`
                    );

                }


            }
            catch(error){

                console.error(
                    "SSE fout:",
                    error
                );


                res.write(
                    `event: error\ndata:${JSON.stringify({
                        message:error.message
                    })}\n\n`
                );

            }



            // wacht 10 seconden

            await new Promise(
                resolve =>
                setTimeout(resolve,10000)
            );


        }


    }



    stream();



    req.on(
        "close",
        ()=>{

            clearInterval(
                heartbeat
            );

            res.end();

        }
    );

}