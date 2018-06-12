var map;
var geocoder;
var coords = [];
var markers = [];
var lines = [];
var clusterlines = [];

var options = {
    center: { // Paris
        lat: 48.864716,
        lng: 2.349014
    },
    zoom: 2,
    gestureHandling: 'cooperative',
    streetViewControl: false,
    mapTypeId: 'roadmap'
}



function initMap() {
    map = new google.maps.Map(document.getElementById('googleMap'), options);
    map.addListener('click', function (event) {
        addMarker(event.latLng);
    });

    geocoder = new google.maps.Geocoder();
    document.getElementById('submit').addEventListener('click', function () {
        geocodeAddress();
    });
}

function geocodeAddress() {
    geocoder.geocode({
        'address': document.getElementById('address').value
    }, function (results, status) {
        if (status === 'OK')
            addMarker(results[0].geometry.location);
        else
            alert('Geocode error: ' + status);
    });
}



function addMarker(location, lat, lng, color) {
    var coord = {
        indice: coords.length+1,
        lat: lat || location.lat(),
        lng: lng || location.lng()
    };
    for (let i = 0; i < coords.length; i++)
        if (JSON.stringify(coord, ['lat', 'lng']) === JSON.stringify(coords[i], ['lat', 'lng']))
            return;

    markers.push(new google.maps.Marker({
        indice: coords.length+1,
        position: location || new google.maps.LatLng(coord.lat, coord.lng),
        map: map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            strokeColor: color || 'red',
            scale: 3
        }
    }));
    coords.push(coord);
}

function addLine(loc1, loc2, color) {
    var line = new google.maps.Polyline({
        path: [loc1, loc2],
        strokeColor: color || 'red',
        geodesic: true,
        strokeOpacity: 1.0,
        strokeWeight: 1,
        icons: [{
            icon: {
                path: google.maps.SymbolPath.FORWARD_OPEN_ARROW
            },
            offset: '50%'
        }]
    });
    if (line.strokeColor == 'red')
        lines.push(line);
    else if (line.strokeColor == 'green')
        clusterlines.push(line);
    line.setMap(map);
}

function drawLines() {
    removeLines();
    for (let i = 0; i < coords.length - 1; i++)
        addLine(coords[i], coords[i + 1]);
}



function setMapAll(objs, map) {
    objs.forEach(obj => obj.setMap(map));
}

function showAll() {
    setMapAll(markers, map);
    setMapAll(lines, map);
}

function hideAll() {
    setMapAll(markers, null);
    setMapAll(lines, null);
}

function deleteMarkers() {
    setMapAll(markers, null);
    coords = [];
    markers = [];
    removeLines();
    removeClusterLines();
}

function removeLines() {
    setMapAll(lines, null);
    lines = [];
}

function removeClusterLines() {
    setMapAll(clusterlines, null);
    clusterlines = [];
}



function clustering() {
    removeClusterLines();
    let clusters = autoKmeans(coords);
    for (let i in clusters.centroids)
        for (let coord of clusters.groups[i])
            addLine(clusters.centroids[i], coord, 'green');
}

function randomCoords() {
    let getRandom = (min, max, int = 0) => {
        let val = Math.random() * (max - min) + min;
        return int ? Math.round(val) : Math.round(val * Math.pow(10, 10)) / Math.pow(10, 10);
    };
    for (let i = 0; i < getRandom(1, 10, 1); i++)
        addMarker(0, getRandom(-84, 84), getRandom(-179, 179), 'blue');
}