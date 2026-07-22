import { sendTelegram } from "../lib/telegram.js";


export default async function handler(req,res){

    await sendTelegram(
`🚢 Test AIS melding

Telegram werkt!

Google Maps:
https://www.google.com/maps?q=52.1234,4.5678`
    );


    res.json({
        ok:true
    });

}