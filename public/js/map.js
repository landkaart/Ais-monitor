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



async function updateShip(){


try{


const response =
await fetch(
"/api/status"
);



const data =
await response.json();



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

${windSpeed} km/u

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

console.log(data.latitude, data.longitude);



const windResponse = await fetch(
`https://api.open-meteo.com/v1/forecast?latitude=${data.latitude}&longitude=${data.longitude}&current=wind_speed_10m,wind_direction_10m`
);

const windData = await windResponse.json();

const windSpeed = windData.current.wind_speed_10m;
const windDirection = windData.current.wind_direction_10m;

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