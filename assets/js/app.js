const APIKEY = 'ddc4d27d871e2930d9a8a37809fcb73cefb6bbf6';
// https://developer.jcdecaux.com/#/opendata/vls?page=getstarted
const city = 'Rouen';

class Station {
    constructor(name, number, address, availableBikes, availableStands, totalStands, banking, status, update, marker, book) {
        this.name = name;
        this.number = number;
        this.address = address; // Non utilisé
        this.availableBikes = availableBikes;
        this.availableStands = availableStands;
        this.totalStands = totalStands;
        this.banking = banking;
        this.status = status;
        this.update = update;
        this.marker = marker;
        this.book = book;
    }
}

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
        let booked = false;

        for (let i = 0; i < apiResults.length; i++) {

            // Création des markers
            let LeafIcon = L.Icon.extend({
                options: {
                   iconSize:     [25, 41],
                   iconAnchor:   [11, 41],
                   popupAnchor:  [0, 0]
                   // Manque le shadow
                }
            });

            let iconColor
            if (apiResults[i].available_bikes > 9) {
                iconColor = './assets/img/marker-icon-green.png';
            } else if (apiResults[i].available_bikes > 4) {
                iconColor = './assets/img/marker-icon-orange.png';
            } else if (apiResults[i].available_bikes > 0) {
                iconColor = './assets/img/marker-icon-red.png';
            } else {
                iconColor = './assets/img/marker-icon-black.png';
            }
            let icon = new LeafIcon({
                iconUrl: iconColor,
            });

            // Affichage des markers sur la map (clusters)
            let marker = L.marker([apiResults[i].position.lat, apiResults[i].position.lng], {icon: icon});
            markersCluster.addLayer(marker);
            map.addLayer(markersCluster);
            marker.addEventListener('click', showInfos);

            // Bouton de réservation
            let book = document.createElement("input");
            book.id = 'book';
            book.type = 'button';
            book.value = 'Réserver à\nla borne ' + apiResults[i].number;
            book.addEventListener('click', booking)

            let station = new Station(apiResults[i].name, apiResults[i].number, apiResults[i].address, apiResults[i].available_bikes, apiResults[i].available_bike_stands, apiResults[i].bike_stands, apiResults[i].banking, apiResults[i].status, apiResults[i].last_update, marker, book);

            function showInfos() {
                document.querySelector('.map__infos__name').textContent = station.name.split('-')[1];
                document.querySelector('.map__infos__number').textContent = station.number;
                document.querySelector('.map__infos__available-bikes').textContent = station.availableBikes;
                document.querySelector('.map__infos__available-stands').textContent = station.availableStands;
                document.querySelector('.map__infos__total-stands').textContent = station.totalStands;
                // Changement du texte de banking
                if (station.banking) {
                    document.querySelector('.map__infos__banking').textContent = 'Oui';
                } else {
                    document.querySelector('.map__infos__banking').textContent = 'Non';
                }
                // Affichage du statut en couleur
                if (station.status === "OPEN") {
                    document.querySelector('.map__infos__status').textContent = 'Ouvert';
                    document.querySelector('.map__infos__status').style.color = '#4BB543';
                } else {
                    document.querySelector('.map__infos__status').textContent = 'Fermé';
                    document.querySelector('.map__infos__status').style.color = '#ff3333';
                }
                // Calcul de la dernière mise à jour
                let update = '< ' + Math.ceil((new Date () - new Date(station.update)) / 1000 / 60) + 'min';
                document.querySelector('.map__infos__update').textContent = update;
                // Mise en place du bouton de réservation
                if (document.querySelector("#book")) {
                    document.querySelector(".book-btn").removeChild(document.querySelector("#book"));
                }
                document.querySelector(".book-btn").appendChild(book);
            }

            function booking() {
                if (!booked) {
                    if (station.availableBikes > 0) {
                        document.querySelector(".map__modale").style.display = "flex";

                        let time = 20 * 60 - 1;
                        let minutes = 20;
                        let secondes = 00;
                        function timer() {
                            minutes = Math.floor(time / 60);
                            secondes = time - minutes * 60;
                            time -= 1;
                            if (book.value !== 'Annuler ?') {
                                book.value = minutes + ' min ' + secondes;
                            }
                        }
                        let bookInterval;
                        function confirmBook() {
                            station.availableBikes -= 1;
                            document.querySelector('.map__infos__available-bikes').textContent = station.availableBikes;
                            book.value = '20 min';
                            book.classList.add('book-abord');
                            book.addEventListener('mouseover', function() {
                                if (booked) {
                                    book.value = 'Annuler ?';
                                }
                            })
                            book.addEventListener('mouseout', function() {
                                if (booked) {
                                    book.value = minutes + ' min ' + secondes;
                                }
                            })
                            book.addEventListener('click', cancelBook);
                            bookInterval = setInterval(timer, 1000);
                            document.querySelector(".map__modale").style.display = "none";
                            document.querySelector('#confirm-book-btn').removeEventListener('click', confirmBook);
                            booked = true;
                        }
                        function cancelBook() {
                            if (booked) {
                                station.availableBikes += 1;
                                document.querySelector('.map__infos__available-bikes').textContent = station.availableBikes;
                                book.value = 'Réserver à\nla borne ' + station.number;
                                book.classList.remove('book-abord');
                                book.removeEventListener('click', cancelBook);
                                clearInterval(bookInterval);
                                booked = false;
                            }
                        }
                        document.querySelector('#confirm-book-btn').addEventListener('click', confirmBook);
                    } else {
                        alert("Réservation impossible, nous n'avons plus de vélo disponible à cette station");
                    }
                } // else --> Possibilité d'annuler la réservation en cours + relance booking()

                // Sliders de présentation
                // Tests W3C et tout...
            }
        }
    })
}
callAPI();