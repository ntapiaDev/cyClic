const APIKEY = 'ddc4d27d871e2930d9a8a37809fcb73cefb6bbf6';
// https://developer.jcdecaux.com/#/opendata/vls?page=getstarted
const city = 'Rouen';

class Station {
    constructor(name, number, address, availableBikes, availableStands, totalStands, banking, status, update, marker, bookBtn, booked) {
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
        this.bookBtn = bookBtn;
        this.booked = booked;
    }
}

let stations = [];
let booked = false;
let bookInterval;

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
            if (apiResults[i].available_bikes > 5) {
                iconColor = './assets/img/marker-icon-green.png';
            } else if (apiResults[i].available_bikes > 0) {
                iconColor = './assets/img/marker-icon-orange.png';
            } else if (apiResults[i].status === 'CLOSED') {
                iconColor = './assets/img/marker-icon-black.png';
            } else {
                iconColor = './assets/img/marker-icon-red.png';
            }
            let icon = new LeafIcon({
                iconUrl: iconColor,
            });

            // Affichage des markers sur la map (clusters)
            let marker = L.marker([apiResults[i].position.lat, apiResults[i].position.lng], {icon: icon});
            marker.bindTooltip(apiResults[i].name.split('-')[1] + ' (' + apiResults[i].available_bikes + ' <i class="fa-solid fa-person-biking"></i>)', {permanent: false, className: "map__label", offset: [3, 0] });
            markersCluster.addLayer(marker);
            map.addLayer(markersCluster);
            marker.addEventListener('click', showInfos);

            // Bouton de réservation
            let bookBtn = document.createElement("input");
            bookBtn.id = 'book';
            bookBtn.type = 'button';
            bookBtn.value = 'Réserver à\nla borne ' + apiResults[i].number;
            bookBtn.addEventListener('click', booking)

            let station = new Station(apiResults[i].name, apiResults[i].number, apiResults[i].address, apiResults[i].available_bikes, apiResults[i].available_bike_stands, apiResults[i].bike_stands, apiResults[i].banking, apiResults[i].status, apiResults[i].last_update, marker, bookBtn, false);
            stations.push(station);

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
                document.querySelector(".book-btn").appendChild(bookBtn);
            }

            function booking() {
                if (!booked) {
                    if (station.availableBikes > 0) {
                        document.querySelector(".map__modale").style.display = "flex";
                        document.querySelector(".map__modale__clear").addEventListener('click', clearCanvas)
                        document.querySelector(".map__modale__close").addEventListener('click', function() {
                            document.querySelector(".map__modale").style.display = "none";
                        })

                        let time = 20 * 60 - 1;
                        let minutes = 20;
                        let secondes = 0;
                        function timer() {
                            minutes = Math.floor(time / 60);
                            secondes = time - minutes * 60;
                            time -= 1;
                            if (bookBtn.value !== 'Annuler ?') {
                                bookBtn.value = minutes + ' min ' + secondes;
                            }
                        }
                        function confirmBook() {
                            if (formControl() === 'Formulaire accepté') {
                                station.availableBikes -= 1;
                                document.querySelector('.map__infos__available-bikes').textContent = station.availableBikes;
                                bookBtn.value = '20 min';
                                bookBtn.classList.add('book-abord');
                                book.addEventListener('mouseover', function() {
                                    if (station.booked) {
                                        book.value = 'Annuler ?';
                                    }
                                })
                                book.addEventListener('mouseout', function() {
                                    if (station.booked) {
                                        book.value = minutes + ' min ' + secondes;
                                    }
                                })
                                bookBtn.addEventListener('click', cancelBook);
                                bookInterval = setInterval(timer, 1000);
                                document.querySelector(".map__modale").style.display = "none";
                                document.querySelector('#confirm-book-btn').removeEventListener('click', confirmBook);
                                document.querySelector(".map__modale__error").textContent = '';
                                station.booked = true;
                                booked = true;
                                sendCanvas();
                                clearCanvas();
                            } else {
                                document.querySelector(".map__modale__error").textContent = formControl();
                            }
                        }
                        function cancelBook() {
                            if (booked) {
                                station.availableBikes += 1;
                                document.querySelector('.map__infos__available-bikes').textContent = station.availableBikes;
                                bookBtn.value = 'Réserver à\nla borne ' + station.number;
                                document.querySelector(".map__modale__error").textContent = '';
                                bookBtn.classList.remove('book-abord');
                                bookBtn.removeEventListener('click', cancelBook);
                                clearInterval(bookInterval);
                                station.booked = false;
                                booked = false;
                            }
                        }
                        document.querySelector('#confirm-book-btn').addEventListener('click', confirmBook);
                    } else {
                        alert("Réservation impossible, nous n'avons plus de vélo disponible à cette station");
                    }
                // Clique sur une station où il n'y a pas déjà de réservation
                } else if (!station.booked) {
                    if (askConfirmation()) {
                        cancel()
                    }
                }
                // Sliders de présentation
                // Tests W3C et tout...
                // Rester dans le canvas
                // alert et confirm?
            }
        }
    })
}

callAPI();

let canvas = document.getElementById("signature");
// Controle du formulaire
function formControl() {
    // Regex :
    let regexName = /[^a-zA-ZÀ-ÿ ]/;
    // Controle du canvas :
    function isCanvasBlank(canvas) {
        return !canvas.getContext('2d')
        .getImageData(0, 0, canvas.width, canvas.height).data
        .some(channel => channel !== 0);
    }

    if (regexName.test(document.querySelector("#name").value) || document.querySelector("#name").value.length < 3) {
        return 'Merci de saisir un nom valide';
    } else if (isCanvasBlank(canvas)) {
        return "Merci d'appliquer votre signature numérique";
    } else if (!document.querySelector("#gdpr").checked) {
        return "Merci d'accepter le règlement général sur la protection des données";
    } else {
        return 'Formulaire accepté';
    }
}
// Envoie du canvas
function sendCanvas() {
    let dataUrl = canvas.toDataURL();
    let signature = dataUrl;
    console.log(signature);
}
// Reset du canvas
function clearCanvas() {
    canvas.width = canvas.width;
}
// Confirmation d'annulation
function askConfirmation() {
    return confirm('Voulez vous annuler votre réservation ?')
}

// Annulation de la réservation
function cancel() {
    for (let i = 0; i < stations.length; i++) {
        if (stations[i].booked === true) {
            stations[i].availableBikes += 1;
            stations[i].bookBtn.value = 'Réserver à\nla borne ' + stations[i].number;
            stations[i].bookBtn.classList.remove('book-abord');
            clearInterval(bookInterval);
            stations[i].booked = false;
            booked = false;
        }
    }
}