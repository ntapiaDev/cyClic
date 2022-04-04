// https://account.mapbox.com/access-tokens/
const accessToken = 'pk.eyJ1IjoibGFyZGV1ciIsImEiOiJjbDFraWVpZTMwMGNyM2tvMnpqcG9mNTN4In0.wHPuEl2kAWxu6o45mXI2cw';

// https://leafletjs.com/SlavaUkraini/examples/quick-start/
let map = L.map('map').setView([49.437, 1.092], 13); // 13 = niveau de zoom

L.tileLayer(`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${accessToken}`, {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11', // mapbox/satellite-v9
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
}).addTo(map);