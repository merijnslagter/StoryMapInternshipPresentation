var imageContainerMargin = 110;  // Margin + padding
var currentBox = 0;
var scrollPosition = 0;
var myStyle = {
    "color": "#f9ed32",
    "weight": 5,
    "opacity": 0.8,
    "fillOpacity": 0.0
}
// This watches for the scrollable container
$('div#contents').scroll(function() {
  scrollPosition = $(this).scrollTop();
});

// This adds data as a new layer to the map
function refreshLayer(data, map, coord, zoom) {
  var dataLayer = L.geoJson(data,{
    style: myStyle
});
  dataLayer.addTo(map);
  map.setView([coord[1], coord[0]], zoom);
}

function initMap() {
  // This creates the Leaflet map with a generic start point, because GeoJSON layer includes all coordinates
  var map = L.map('map', {
    center: [0, 0],
    zoom: 7,
    scrollWheelZoom: true
  });

  // This displays a base layer map (other options available)
  var lightAll = new L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
  }).addTo(map);

  // This customizes link to view source code; add your own GitHub repository
  map.attributionControl
  .setPrefix('View <a href="http://github.com/jackdougherty/leaflet-storymap-layers" target="_blank">code on GitHub</a>, created with <a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>');

  // This loads the GeoJSON map data file from a local folder
  $.getJSON('map.geojson', function(data) {
    var geojson = L.geoJson(data, {
      onEachFeature: function (feature, layer) {
        (function(layer, properties) {

          // This creates the contents of each chapter from the GeoJSON data. Unwanted items can be removed, and new ones can be added
          var chapter = $('<p></p>', {
            text: feature.properties['chapter'],
            class: 'chapter-header'
          });

          var image = $('<img>', {
            src: feature.properties['image'],
          });

          var source = $('<a>', {
            text: feature.properties['source-credit'],
            href: feature.properties['source-link'],
            target: "_blank",
            class: 'source'
          });

          var description = $('<p></p>', {
            text: feature.properties['description'],
            class: 'description'
          });

          var container = $('<div></div>', {
            id: 'container' + feature.properties['id'],
            class: 'image-container'
          });

          var imgHolder = $('<div></div', {
            class: 'img-holder'
          });

          imgHolder.append(image);

          container.append(imgHolder);
          $('#contents').append(container);

          var i;
          var areaTop = -160;
          var areaBottom = 000;

          // Calculating total height of blocks above active
          for (i = 1; i < feature.properties['id']; i++) {
            areaTop += $('div#container' + i).height() + imageContainerMargin;
          }

          areaBottom = areaTop + $('div#container' + feature.properties['id']).height();

          $('div#contents').scroll(function() {
            if ($(this).scrollTop() >= areaTop && $(this).scrollTop() < areaBottom) {
              if (feature.properties['id'] != currentBox) {
                currentBox = feature.properties['id'];

                $('.image-container').removeClass("inFocus").addClass("outFocus");
                $('div#container' + feature.properties['id']).addClass("inFocus").removeClass("outFocus");

                
		
		// This removes all layers besides the base layer
                map.eachLayer(function (layer) {
                  if (layer != lightAll) {
                    map.removeLayer(layer);
		    
                  }
                });

		 
		 
                // This adds another data layer
                $.getJSON(feature.properties['layer'], function(data) {
                  var coord = feature.geometry['coordinates'];
                  var zoom = feature.properties['zoom'];
		 refreshLayer(data, map, coord, zoom);
                });
		
		
              }
            }
          });

        })(layer, feature.properties);
      }
    });

    $('#contents').append("<div class='space-at-the-bottom'><a href='#space-at-the-top'><i class='fa fa-chevron-up'></i></br><small>Top</small></a></div>");

  });
}


initMap();

$("div#contents").animate({ scrollTop: 5 });
