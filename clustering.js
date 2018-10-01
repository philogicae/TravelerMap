function distanceHaversine(coord1, coord2) {
    function toRad(x) {
        return x * Math.PI / 180;
    }
    let R = 6371; // Rayon de la Terre en km
    let lat1 = coord1.lat;
    let lon1 = coord1.lng;
    let lat2 = coord2.lat;
    let lon2 = coord2.lng;

    let x1 = lat2 - lat1;
    let dLat = toRad(x1);
    let x2 = lon2 - lon1;
    let dLon = toRad(x2)

    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let distance = R * c;
    return distance;
}

function partitionner(coords, centroids) {
    let groups = [];
    for (let i in centroids)
        groups.push([]);
    let sse = 0;

    let min, cluster, distance;
    for (let coord of coords) {
        min = Infinity;
        cluster = -1;
        for (let i in centroids) {
            distance = distanceHaversine(coord, centroids[i]);
            if (distance < min) {
                min = distance;
                cluster = i;
            }
        }
        groups[cluster].push(coord);
        sse += min * min;
    }
    return {
        groups: groups,
        score: sse // Sum of Squared Errors
    };
}

function remoyenner(groups, centroids) {
    let newcentroids = [];
    let x, y;
    for (let i in centroids) {
        x = 0;
        y = 0;
        for (let coord of groups[i]) {
            x += coord.lat;
            y += coord.lng;
        }
        newcentroids.push({
            lat: x / groups[i].length,
            lng: y / groups[i].length
        });
    }
    return newcentroids;
}

function initCentroids(coords, k) {
    let bestcentroids;
    let bestscore = Infinity;

    let used, rand, centroids, score;
    for (let i = 0; i < (k + 5); i++) {
        used = [];
        centroids = [];
        while (used.length != k) {
            rand = Math.round(Math.random() * (coords.length - 1));
            if (!used.includes(rand)) {
                used.push(rand);
                centroids.push({
                    lat: coords[rand].lat,
                    lng: coords[rand].lng
                });
            }
        }
        score = partitionner(coords, centroids).score;
        if (score < bestscore) {
            bestcentroids = centroids;
            bestscore = score;
        }
    }
    return bestcentroids;
}

function kmeans(coords, k) {
    let groups;
    let centroids = initCentroids(coords, k);
    let oldcentroids;
    let changed = true;
    while (changed) {
        groups = partitionner(coords, centroids).groups;
        oldcentroids = JSON.stringify(centroids);
        centroids = remoyenner(groups, centroids);
        if (JSON.stringify(centroids) == oldcentroids)
            changed = false;
    }
    return {
        centroids: centroids,
        groups: groups
    };
}



function elbowMethod(clusters) {
    let sse = 0,
        distance;
    for (let i in clusters.centroids)
        for (let coord of clusters.groups[i]) {
            distance = distanceHaversine(clusters.centroids[i], coord);
            sse += distance * distance;
        }
    return sse;
}

function bestK(k, score) {
    let y = (x) => {
        let a = (score[k.length - 1] - score[0]) / (k[k.length - 1] - k[0]);
        let b = score[0] - a * k[0];
        return a * x + b;
    }
    let best, max = 0,
        diff;
    for (let i in k) {
        diff = y(i) - score[i];
        if (diff >= max) {
            max = diff;
            best = i;
        }
    }
    return best;
}

function autoKmeans(coords) {
    let clusters = [{}],
        k = [],
        score = [];
    for (let i = 1; i <= Math.ceil(2 * coords.length / 3); i++) {
        k.push(i);
        clusters.push(kmeans(coords, i));
        score.push(elbowMethod(clusters[i]));
    }
    let best = bestK(k, score);
    printGraph(k, score, best);
    return clusters[k[best]];
}



function printGraph(k, score, best) {
    Plotly.newPlot('ktester', [{
        x: k,
        y: score,
        name: 'K-Means',
        mode: 'lines+markers'
    }, {
        x: [k[best]],
        y: [score[best]],
        name: 'Best K',
        mode: 'markers',
        marker: {
            size: 14
        }
    }], {
        title: 'Automatic K-Means (using Elbow Method for Clustering)',
        xaxis: {
            title: 'Number of Clusters'
        },
        yaxis: {
            title: 'Sum of Squared Errors (SSE)'
        }
    });
}