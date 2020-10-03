
//store API query url
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


//create a function for marker size

function markerSize(magnitude){
    return magnitude *4.25;
}

//create a function for marker color

function markerColor(depth){
    if (depth <= 5) {
        return "#32dcff"
    }
    else if (depth <=10) {
        return "#32ff84"
    }
    else if (depth <=20) {
        return "#32ff32"
    }
    else if (depth <=30) {
        return "#e5ff32"
    }
    else if (depth <=40) {
        return "#ffb232"
    }
    else {
        return "#ff3232"
    }
}


//perform a GET request to the query URL
d3.json(url, function(data){
    createFeatures(data.features);
});

function createFeatures(earthquakeData){
    function onEachFeature(feature, layer){
        layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr> <h4><strong> Earthquake Magnitude: " +feature.properties.mag +"</strong></h4>\
        <h4><strong> Earthquake Depth: " +feature.geometry.coordinates[2] +"km</strong></h4><hr>\
        <p><strong>" + new Date(feature.properties.time) + "</strong></p>");
    }

    var earthquakes = L.geoJson(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: markerSize(feature.properties.mag),
                fillColor: markerColor(feature.geometry.coordinates[2]),
                color: "black",
                fillOpacity: 1,
                stroke: true,
                weight: .5
            })
        },
        onEachFeature: onEachFeature
    });
    
    createMap(earthquakes);
}

function createMap(earthquakes) {

    var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });

    var satMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-streets-v11",
        accessToken: API_KEY
    });

    var baseMaps = {
        "Light Map": lightMap,
        "Satellite Map": satMap
    };

    var overlayMaps = {
        Earthquakes: earthquakes
    };

    var myMap = L.map("map", {
        center: [35.000,-115.000],
        zoom: 5,
        layers: [lightMap, earthquakes]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}