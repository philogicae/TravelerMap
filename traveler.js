function swap(tab, i, j) {
    let temp = tab[i];
    tab[i] = tab[j];
    tab[j] = temp;
}

function calculateDistance(coords, order, cycle = false) {
    let total = 0;
    for (let i = 0; i < order.length-1; i++)
        total += distanceHaversine(coords[order[i]], coords[order[i+1]]);
    return cycle ? total + distanceHaversine(coords[order[order.length-1]], coords[order[0]]) : total;
}

function nextOrder(order) {
    var largestI = -1,
        largestJ = -1;
    for (let i = 0; i < order.length - 1; i++)
        if (order[i] < order[i + 1])
            largestI = i;
    if (largestI != -1) {
        for (let j = 0; j < order.length; j++)
            if (order[largestI] < order[j])
                largestJ = j;
        swap(order, largestI, largestJ);
        let endArray = order.splice(largestI + 1);
        endArray.reverse();
        order = order.concat(endArray);
    }
    return order;
}


function sortCentroids(){
    if (clusters.centroids.length > 3){
        let order = [], oldOrder, bestOrder, min, km;
        for (let i = 0; i < clusters.centroids.length; i++)
            order.push(i);
        bestOrder = JSON.parse(JSON.stringify(order));
        min = calculateDistance(clusters.centroids, order, true);

        while (oldOrder != JSON.stringify(order)) {
            oldOrder = JSON.stringify(order);
            order = nextOrder(order);
            km = calculateDistance(clusters.centroids, order, true);
            if (km < min) {
                bestOrder = JSON.parse(JSON.stringify(order));
                min = km;
            }
        }

        var newCentroids = [];
        var newGroups = [];
        for (let i = 0; i < clusters.centroids.length; i++){
            newCentroids.push(clusters.centroids[bestOrder[i]]);
            newGroups.push(clusters.groups[bestOrder[i]]);
        }
        clusters.centroids = newCentroids;
        clusters.groups = newGroups;
    }
}


function placeInputOutput(){
    for (let i = 0; i < clusters.centroids.length-1; i++) {
        let bestInput = -1,
            bestOutput = -1,
            km = Infinity,
            min = Infinity;
        for (let j = 0; j < clusters.groups[i+1].length; j++) {
            km = distanceHaversine(clusters.centroids[i], clusters.groups[i+1][j]);
            if (km < min){
                bestInput = j;
                min = km;
            }
        }
        swap(clusters.groups[i+1], 0, bestInput);

        km = Infinity,
        min = Infinity;
        for (let j = 0; j < clusters.groups[i].length; j++) {
            km = distanceHaversine(clusters.groups[i][j], clusters.groups[i+1][0]);
            if (km < min) {
                bestOutput = j;
                min = km;
            }
        }
        swap(clusters.groups[i], bestOutput, clusters.groups[i].length-1);
    }

    let last = clusters.centroids.length-1;
        bestInput = -1,
        bestOutput = -1,
        km = Infinity,
        min = Infinity;
    for (let j = 0; j < clusters.groups[0].length; j++) {
        km = distanceHaversine(clusters.centroids[last], clusters.groups[0][j]);
        if (km < min) {
            bestInput = j;
            min = km;
        }
    }
    swap(clusters.groups[0], 0, bestInput);

    km = Infinity,
    min = Infinity;
    for (let j = 0; j < clusters.groups[last].length; j++) {
        km = distanceHaversine(clusters.groups[last][j], clusters.groups[0][0]);
        if (km < min) {
            bestOutput = j;
            min = km;
        }
    }
    swap(clusters.groups[last], bestOutput, clusters.groups[last].length-1);
}


function sortGroups(){
    var newGroups = [];
    let order, bestOrder, min, km;

    for (let i in clusters.centroids) {
        if (clusters.groups[i].length < 4){
            let clt = [];
            for (let j = 0; j < clusters.groups[i].length; j++)
                clt.push(clusters.groups[i][j]);
            newGroups.push(clt);
        }
        else {
            order = [];
            for (let j = 1; j < clusters.groups[i].length - 1; j++)
                order.push(j);
            bestOrder = JSON.parse(JSON.stringify(order));
            min = calculateDistance(clusters.groups[i], [0, ...order, clusters.groups[i].length - 1]);

            let oldOrder;
            while (oldOrder != JSON.stringify(order)) {
                oldOrder = JSON.stringify(order);
                order = nextOrder(order);
                km = calculateDistance(clusters.groups[i], [0, ...order, clusters.groups[i].length - 1]);
                if (km < min) {
                    bestOrder = JSON.parse(JSON.stringify(order));
                    min = km;
                }
            }

            let clt = [clusters.groups[i][0]];
            for (let j = 0; j < bestOrder.length; j++)
                clt.push(clusters.groups[i][bestOrder[j]]);
            clt.push(clusters.groups[i][clusters.groups[i].length - 1]);
            newGroups.push(clt);
        }
    }
    clusters.groups = newGroups;
}


function calculateShortestRoad(){
    sortCentroids();
    placeInputOutput();
    sortGroups();
}