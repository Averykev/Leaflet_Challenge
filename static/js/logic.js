//store API query url's
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var tectonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

//create variables that will hold our json data
//had to create these outside of the function so that they would be "defined"
var earthquakes = new L.LayerGroup();
var tectonicPlates = new L.LayerGroup();

//perform a GET request to the query URL
//nest a second promise in the GET request in order to pull the tectonic plate data as well
d3.json(url, function(data){
    myMap = createFeatures(data.features);
    d3.json(tectonicURL, function(tectonicData){
        L.geoJson(tectonicData, {
            color: "blue",
            stroke: true,
            weight: 2,
            fillOpacity: 0

        }).addTo(tectonicPlates);

        tectonicPlates.addTo(myMap)
    });
});

//createFeatures function that creates the popups, and also the locations of the earthquake markers 
function createFeatures(earthquakeData){
    function onEachFeature(feature, layer){
        layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr> <h4><strong> Earthquake Magnitude: " +feature.properties.mag +"</strong></h4>\
        <h4><strong> Earthquake Depth: " +feature.geometry.coordinates[2] +"km</strong></h4><hr>\
        <p><strong>" + new Date(feature.properties.time) + "</strong></p>");
    }

    var earthquakes = L.geoJson(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: markerRadius(feature.properties.mag),
                fillColor: markerColor(feature.geometry.coordinates[2]),
                color: "black",
                fillOpacity: .8,
                stroke: true,
                weight: .5
            })
        },
        onEachFeature: onEachFeature
    });
    
    myMap = createMap(earthquakes);

    return myMap;
};

//createMap function that creates the layers, the overlays, and the legend
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

    var terrainMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });

    //create baseMaps
    var baseMaps = {
        "Light Map": lightMap,
        "Terrain Map": terrainMap,
        "Satellite Map": satMap        
    };

    //create overlayMaps
    var overlayMaps = {
        Earthquakes: earthquakes,
        TectonicPlates: tectonicPlates
    };
    
    //attache the layers to the map and center the map
    var myMap = L.map("map", {
        center: [35.000,-115.000],
        zoom: 5,
        layers: [lightMap, earthquakes]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    //adding a legend to the map and using a for loop to write out the HTML code
    var legend = L.control({
        position: 'bottomright'
    });

    legend.onAdd = function() {
        var div = L.DomUtil.create('div', 'legend');
        
            colors = ["#32dcff", "#ff99ff","#32ff32","#e5ff32","#ffb232","#ff3232"];
            labels = ["< 5m", "5m - 10m", "10m - 20m", "20m - 30m", "30m - 40m", "> 40m"];

        for (var i = 0; i <colors.length; i++) {
            div.innerHTML += '<li style="padding: 4px; background-color:' + colors[i] + '">' + labels[i] + '</li>';
            }

        return div;
    };

    legend.addTo(myMap);

    return myMap;
};

//create a function for marker size
function markerRadius(magnitude){
    return magnitude *4.25;
};

//create a function for marker color
function markerColor(depth){
    if (depth <= 5) {
        return "#32dcff"
    }
    else if (depth <=10) {
        return "#ff99ff"
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
};
