export async function sendTelegram(message){

    const response = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({

                chat_id: process.env.TELEGRAM_CHAT_ID,
                text: message

            })
        }
    );


    const result = await response.json();

    console.log(result);

    return result;
}