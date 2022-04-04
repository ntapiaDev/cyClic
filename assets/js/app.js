const APIKEY = 'ddc4d27d871e2930d9a8a37809fcb73cefb6bbf6';
// https://developer.jcdecaux.com/#/opendata/vls?page=getstarted
const city = 'Rouen';

class Station {
    constructor(name, number, address, availableBikes, availableStands, totalStands, banking, status, update, marker) {
        this.name = name;
        this.number = number;
        this.address = address;
        this.availableBikes = availableBikes;
        this.availableStands = availableStands;
        this.totalStands = totalStands;
        this.banking = banking;
        this.status = status;
        this.update = update;
        this.marker = marker;
    }
}

let stations = [];

// API JCDecaux
function callAPI() {
    fetch(`https://api.jcdecaux.com/vls/v1/stations?contract=${city}&apiKey=${APIKEY}`)
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        let apiResults = data;
        console.log(apiResults);

        let markersCluster = new L.MarkerClusterGroup();
        for (let i = 0; i < apiResults.length; i++) {

            // Changement du texte de banking
            if (apiResults[i].banking) {
                banking = "Oui";
            } else {
                banking = "Non";
            }
            // Calcul de la dernière mise à jour
            let update = '< ' + Math.ceil((new Date () - new Date(apiResults[i].last_update)) / 1000 / 60) + 'min';

            // Création du marker
            let marker = L.marker([apiResults[i].position.lat, apiResults[i].position.lng]);

            let station = new Station(apiResults[i].name, apiResults[i].number, apiResults[i].address, apiResults[i].available_bikes, apiResults[i].available_bike_stands, apiResults[i].bike_stands, banking, apiResults[i].status, update, marker);
            stations.push(station);
            markersCluster.addLayer(stations[i].marker);
            map.addLayer(markersCluster);
            
            let icons = document.querySelectorAll(".leaflet-marker-icon"); --> cibler les marqueurs !
            // if (apiResults[i].available_bikes > 9) {
            //     icons[i].src = "./assets/img/marker-icon-green.png";
            // } else if (apiResults[i].available_bikes > 4) {
            //     icons[i].src = "./assets/img/marker-icon-orange.png";
            // } else if (apiResults[i].available_bikes > 0) {
            //     icons[i].src = "./assets/img/marker-icon-red.png";
            // } else {
            //     icons[i].src = "./assets/img/marker-icon-black.png";
            // }

            // Affichage des données
            // icons[i].addEventListener('click', function() {

            //     let station = new Station(apiResults[i].name, apiResults[i].number, apiResults[i].address, apiResults[i].available_bikes, apiResults[i].available_bike_stands, apiResults[i].bike_stands, banking, apiResults[i].status, update);

            //     document.querySelector('.map__infos__name').textContent = station.name.split('-')[1];
            //     document.querySelector('.map__infos__number').textContent = station.number;
            //     // document.querySelector('.map__infos__address').textContent = station.address;
            //     document.querySelector('.map__infos__available-bikes').textContent = station.availableBikes;
            //     document.querySelector('.map__infos__available-stands').textContent = station.availableStands;
            //     document.querySelector('.map__infos__total-stands').textContent = station.totalStands;
            //     document.querySelector('.map__infos__banking').textContent = station.banking;
            //     // Affichage du statut en couleur
            //     if (station.status === "OPEN") {
            //         document.querySelector('.map__infos__status').textContent = 'Ouvert';
            //         document.querySelector('.map__infos__status').style.color = '#4BB543';
            //     } else {
            //         document.querySelector('.map__infos__status').textContent = 'Fermé';
            //         document.querySelector('.map__infos__status').style.color = '#ff3333';
            //     }
            //     document.querySelector('.map__infos__update').textContent = station.update;
            // })
        }
    })
}

callAPI();