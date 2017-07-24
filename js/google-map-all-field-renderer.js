
var google_map_field_map;

(function ($, Drupal) {

  Drupal.behaviors.google_map_all_field_renderer = {
    attach: function (context, settings) {

      $('.google-map-field.map-all .map-container').once('.google-map-field-processed').each(function(index, item) {
        paintMap(context, settings, this);
      });

      $('#region-selector', context).on('change', function(){
        $(document, context).trigger('region-change');
        var mapContainer = $(this).parent().find('.map-container')[0];
        paintMap(context, settings, mapContainer);
      });
    }
  };

  paintMap = function(context, settings, currentMap) {
    // Get the settings for the map from the Drupal.settings object.
    var google_map_field_settings = settings.google_map_field.all.config;
    var lat = $(currentMap).attr('data-lat');
    var lon = $(currentMap).attr('data-lon');
    var zoom = parseInt($(currentMap).attr('data-zoom'));
    var type = $(currentMap).attr('data-type');
    var show_controls = $(currentMap).attr('data-controls-show') === "true";
    var regionSelected = $('#region-selector').val();
    var markerArray = [];
    var infoWindow = [];
    var markerIndex = 0;
    var routeObj = [];
    var markersSet = 0;


// Create the map coords and map options.
    var latlng = new google.maps.LatLng(lat, lon);
    var mapOptions = {
      zoom: zoom,
      center: latlng,
      streetViewControl: false,
      mapTypeId: type,
      disableDefaultUI: !show_controls
    };

    // Initial Map Setup.
    var google_map_field_map = new google.maps.Map(currentMap, mapOptions);
    google.maps.event.trigger(google_map_field_map, 'resize');

    // If routes are enabled gather data and display the routes
    if (google_map_field_settings.route) {
      $.each(settings.google_map_field.all.route, function (routeLoopItemsIndex) {
        if (settings.google_map_field.all.regions[routeLoopItemsIndex] === regionSelected
          || regionSelected === 'all'
          || regionSelected === null
        ) {
          routeObj = toObj(settings.google_map_field.all.route[routeLoopItemsIndex]);

          $.each(routeObj, function (routeLoopItemIndex, routeLoopItem) {
            new google.maps.Polyline({
              path: routeLoopItem,
              geodesic: true,
              strokeColor: routeLoopItem[0].color,
              strokeOpacity: 1.0,
              strokeWeight: routeLoopItem[0].size
            }).setMap(google_map_field_map);
          });
        }
      });
    }

    var LatLngList = [];
    // If Markers are enabled gather data and display the markers.
    if (google_map_field_settings.marker) {
      $.each(settings.google_map_field.all.marker, function (markerLoopIndex) {
        if (settings.google_map_field.all.regions[markerLoopIndex] === regionSelected
          || regionSelected === 'all'
          || regionSelected === null
        ) {
          markerTemp = toObj(settings.google_map_field.all.marker[markerLoopIndex]);
          $.each(markerTemp, function (markerLoopItemIndex, markerLoopItem) {

            LatLngList.push(new google.maps.LatLng (markerLoopItem[0].lat, markerLoopItem[0].lng));

            if (google_map_field_settings.marker) {
              markersSet++;

              // drop a marker at the specified lat/lng coords
              markerArray[markerIndex] = new google.maps.Marker({
                position: markerLoopItem[0],
                optimized: false,
                draggable: false,
                visible: true,
                map: google_map_field_map,
                icon: markerLoopItem[0].flag,
                markerIndex: markerIndex
              });

              if (google_map_field_settings.tooltip && markerLoopItem[0].notes !== '') {
                infoWindow[markerIndex] = new google.maps.InfoWindow({
                  content: markerLoopItem[0].notes
                });
                markerArray[markerIndex].addListener('click', function () {
                  infoWindow[this.markerIndex].open(google_map_field_map, this);
                });
              }
              markerIndex++;
            }
          });
        }
      });
    }
    if (markersSet > 0) {
      $('.map__error-message').hide();
      console.log('pang');
      latlngbounds = new google.maps.LatLngBounds();
      LatLngList.forEach(function(latLngNew){
        latlngbounds.extend(latLngNew);
      });

      google_map_field_map.setCenter(latlngbounds.getCenter());
      if (markersSet > 1){
        google_map_field_map.fitBounds(latlngbounds);
      }
    }
    else {
      $('.map__error-message').show();

    }

  };

  toObj = function(string) {
    var returnObj = [];
    try {
      string = JSON.parse(string);
      string = $.map(string, function(value, index) {
        return [value];
      });
      string.forEach(function (pathSet, pathIndex){
        pathSet.forEach(function(pathCoords, pathCoordsIndex) {
          pathSet[pathCoordsIndex] = JSON.parse(pathCoords);
        });
        returnObj.push(pathSet);
      });

      return returnObj;
    } catch (e) {
      return [];
    }
  };

})(jQuery, Drupal);
