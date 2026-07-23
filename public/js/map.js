const map = L.map("map")
    .setView([52, 5], 8);



const street = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution: "© OpenStreetMap"
    }
);


const sea = L.tileLayer(
    "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png",
    {
        maxZoom: 18,
        attribution: "© OpenSeaMap"
    }
);



street.addTo(map);
sea.addTo(map);



L.control.layers(
    {
        "Straatkaart": street
    },
    {
        "Zeekaart": sea
    }
).addTo(map);





const shipIcon = L.icon({

    iconUrl: "/img/ship.png",

    iconSize: [
        50,
        50
    ],

    iconAnchor: [
        25,
        25
    ]

});



let marker = null;




async function updateShip() {


    console.log("AIS update gestart");


    try {


        const response =
        await fetch("/api/status");


        if(!response.ok){

            throw new Error(
                "API fout: " + response.status
            );

        }



        const data =
        await response.json();



        console.log("Data:", data);




        document.getElementById("status").innerHTML =

        `
        <b>Status:</b>
        ${data.status}

        <br>

        <b>Snelheid:</b>
        ${data.speed} knopen

        <br>

        <b>Laatste AIS:</b>
        ${data.minutes_ago} min geleden

        <br><br>

        🌬 <b>Wind:</b>
        ${data.wind_compass}
        ${data.wind_bft} Bft
        (${data.wind_speed} km/u)

        <br>

        🌧 <b>Regen:</b>
        ${data.rain} mm

        <br>

        🌡 <b>Temperatuur:</b>
        ${data.temperature} °C

        <br><br>

        <a href="${data.google_maps}" target="_blank">
        📍 Google Maps
        </a>
				
				<div id="marineTraffic"></div>
				
				
        `;

         const marineTrafficUrl =
`https://www.marinetraffic.com/nl/ais/details/ships/mmsi:${data.mmsi}`;


document.getElementById("marineTraffic").innerHTML = `
<a href="${marineTrafficUrl}"
onclick="window.open(this.href,'marinetraffic','width=1200,height=800');return false;">
⚓ MarineTraffic
</a>
`;


        const pos = [

            Number(data.latitude),

            Number(data.longitude)

        ];



        if(!marker){


            marker =
            L.marker(
                pos,
                {
                    icon: shipIcon
                }
            )
            .addTo(map);



            map.setView(
                pos,
                14
            );


        }
        else {


            marker.setLatLng(pos);


        }





        marker.bindPopup(

        `
        <b>🚢 MMSI:</b>
        ${data.mmsi}

        <br>

        <b>Status:</b>
        ${data.status}

        <br>

        <b>Snelheid:</b>
        ${data.speed} knopen

        <br><br>

        🌬 Wind:
        ${data.wind_compass}
        ${data.wind_bft} Bft

        <br>

        🌧 Regen:
        ${data.rain} mm

        <br>

        🌡 Temp:
        ${data.temperature} °C

        <br><br>

        <a href="${data.google_maps}" target="_blank">
        📍 Google Maps
        </a>
        `

        );


    }
    catch(error){

        console.error(
            "Update fout:",
            error
        );


        document.getElementById("status").innerHTML =
        `
        ⚠️ Fout bij laden AIS:
        ${error.message}
        `;

    }

}





updateShip();


setInterval(
    updateShip,
    60000
);