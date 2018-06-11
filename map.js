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



function addMarker(location) {
    var coord = {
        indice: coords.length + 1,
        lat: location.lat(),
        lng: location.lng()
    };
    for (let i = 0; i < coords.length; i++)
        if (JSON.stringify(coord, ['lat', 'lng']) === JSON.stringify(coords[i], ['lat', 'lng']))
            return;
    coords.push(coord);

    var marker = new google.maps.Marker({
        indice: coords.length + 1,
        position: location,
        map: map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            strokeColor: 'red',
            scale: 3
        }
    });
    markers.push(marker);
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
    if(line.strokeColor == 'red')
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
    clusters = autoKmeans(coords);
    for (let i in clusters.centroids)
        for (let coord of clusters.groups[i])
            addLine(clusters.centroids[i], coord, 'green');
}