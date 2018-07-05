function swap(tab, i, j) {
    let temp = tab[i];
    tab[i] = tab[j];
    tab[j] = temp;
}

function calculateDistance(coords, order) {
    let total = 0;
    for (let i = 0; i < order.length; i++)
        if (i == coords.length - 1)
            total += distanceHaversine(coords[order[i]], coords[order[0]]);
        else
            total += distanceHaversine(coords[order[i]], coords[order[i + 1]]);
    return total;
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

function calculateShortestRoad() {
    var newGroups = [];
    let order, bestOrder, min, km;

    for (let i in clusters.centroids) {
        order = [];
        for (let j = 0; j < clusters.groups[i].length; j++)
            order.push(j);
        bestOrder = JSON.parse(JSON.stringify(order));
        min = calculateDistance(clusters.groups[i], order);

        if (clusters.groups[i].length > 3) {
            let oldOrder;
            while (oldOrder != JSON.stringify(order)) {
                oldOrder = JSON.stringify(order);
                order = nextOrder(order);
                km = calculateDistance(clusters.groups[i], order);
                if (km < min) {
                    bestOrder = JSON.parse(JSON.stringify(order));
                    min = km;
                }
            }
        }

        let clt = [];
        for (let j = 0; j < clusters.groups[i].length; j++)
            clt.push(clusters.groups[i][bestOrder[j]]);
        newGroups.push(clt);
    }

    clusters.groups = newGroups;
}