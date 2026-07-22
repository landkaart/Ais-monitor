import { db } from "../lib/db.js";
import { distance } from "../lib/distance.js";
import { sendTelegram } from "../lib/telegram.js";


export default async function handler(req, res) {

try {


const mmsi =
process.env.MMSI;



const url =
`https://api.marinesia.com/api/v1/vessel/${mmsi}/location/latest?key=${process.env.MARINESIA_KEY}`;



const response =
await fetch(url);


const json =
await response.json();



if(!json.data){

return res.status(404).json({
error:"Geen AIS data"
});

}



const vessel =
json.data;



const lat =
Number(vessel.lat);


const lng =
Number(vessel.lng);


const speed =
Number(vessel.sog || 0);



const status =
speed > 0.5
?
"VAART"
:
"STIL";



// vorige positie

const previous =
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



let moved=0;



if(previous.rows.length){


moved =
distance(

previous.rows[0].latitude,

previous.rows[0].longitude,

lat,

lng

);

}



// huidige status ophalen

const state =
await db.execute({

sql:`
SELECT *
FROM vessel_state
WHERE mmsi=?
`,

args:[
mmsi
]

});



let anchorLat = lat;
let anchorLng = lng;



if(state.rows.length){


anchorLat =
state.rows[0].anchor_lat;


anchorLng =
state.rows[0].anchor_lng;

}



// nieuw ankerpunt als schip stil ligt

if(
status==="STIL" &&
!state.rows.length
){

await db.execute({

sql:`
INSERT INTO vessel_state
(
mmsi,
status,
anchor_lat,
anchor_lng
)
VALUES(?,?,?,?)
`,

args:[

mmsi,

status,

lat,

lng

]

});

}



// ankerafstand

const anchorDistance =
distance(

anchorLat,

anchorLng,

lat,

lng

);



// alarmcontrole

let sendAlarm=false;

let alarmType="";



// normaal bewegen

if(
status==="VAART" &&
moved > 100
){

sendAlarm=true;

alarmType="MOVE";

}



// ankeralarm

if(
status==="STIL" &&
anchorDistance > 100
){

sendAlarm=true;

alarmType="ANCHOR";

}



// spamcontrole

if(sendAlarm){


const last =
await db.execute({

sql:`
SELECT last_alarm
FROM vessel_state
WHERE mmsi=?
`,

args:[
mmsi
]

});



if(last.rows.length){


const vorige =
new Date(
last.rows[0].last_alarm
);


const minuten =
(Date.now()-vorige)/60000;


if(minuten < 60){

sendAlarm=false;

}

}

}



// opslaan positie

await db.execute({

sql:`
INSERT INTO positions
(
mmsi,
latitude,
longitude,
speed,
status
)
VALUES(?,?,?,?,?)
`,

args:[

mmsi,

lat,

lng,

speed,

status

]

});





if(sendAlarm){


const maps =
`https://www.google.com/maps?q=${lat},${lng}`;



let title =
alarmType==="ANCHOR"
?
"⚓ ANKERALARM"
:
"🚢 SCHIP BEWEEGT";



await sendTelegram(

`${title}

MMSI:
${mmsi}

Status:
${status}

Afstand:
${Math.round(moved)} meter

Ankerafstand:
${Math.round(anchorDistance)} meter

Snelheid:
${speed} knopen

Positie:
${lat}, ${lng}

Google Maps:
${maps}`

);



// laatste alarm opslaan

await db.execute({

sql:`
UPDATE vessel_state
SET last_alarm=CURRENT_TIMESTAMP
WHERE mmsi=?
`,

args:[
mmsi
]

});

}


return res.json({

ok:true,

status,

speed,

moved:Math.round(moved),

anchorDistance:Math.round(anchorDistance)

});


}
catch(error){

console.error(error);

return res.status(500).json({

error:error.message

});

}


}