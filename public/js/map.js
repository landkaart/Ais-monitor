const map =
L.map("map")
.setView(
[52,5],
8
);



L.tileLayer(

"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

{

maxZoom:19

}

).addTo(map);



const shipIcon =
L.icon({

iconUrl:"/img/ship.png",

iconSize:[
50,
50
],

iconAnchor:[
25,
25
]

});



let marker;

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

const beaufort = kmhToBeaufort(windSpeed);



async function updateShip(){


try{


const response =
await fetch(
"/api/status"
);



const data =
await response.json();

const windResponse = await fetch(
`https://api.open-meteo.com/v1/forecast?latitude=${data.latitude}&longitude=${data.longitude}&current=wind_speed_10m,wind_direction_10m`
);

const windData = await windResponse.json();

const windSpeed = windData.current.wind_speed_10m;
const windDirection = windData.current.wind_direction_10m;



document.getElementById("status").innerHTML =

`
<b>Status:</b>
${data.status}

<br>

<b>Snelheid:</b>
${data.speed}
knopen

<br>

<b>Laatste AIS:</b>
${data.minutes_ago}
min geleden

<br>


<b>Wind:</b>

<b>

${windSpeed} km/u (${beaufort} Bft)

<br>

<b>Windrichting:</b>

${windDirection}°



<a href="${data.google_maps}"
target="_blank">

📍 Google Maps

</a>

`;



const pos =
[
data.latitude,
data.longitude
];

//console.log(data.latitude, data.longitude);

alert(data.latitude + ", " + data.longitude);




if(!marker){


marker =
L.marker(
pos,
{
icon:shipIcon
}

)
.addTo(map);


map.setView(
pos,
14
);


}
else{


marker.setLatLng(pos);


}



marker.bindPopup(

`

<b>MMSI:</b>
${data.mmsi}

<br>

<b>Status:</b>
${data.status}

<br>

<b>Snelheid:</b>
${data.speed}
knopen

<br><br>

<a target="_blank"
href="${data.google_maps}">
Google Maps
</a>

`

);


}

catch(error){

console.error(error);

}

}



updateShip();


setInterval(
updateShip,
60000
);