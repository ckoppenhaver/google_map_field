
var google_map_field_map;

(function ($, Drupal) {

  Drupal.behaviors.google_map_field_renderer = {
    attach: function (context, settings) {
      $('.google-map-field:not(.map-all) .map-container').once('.google-map-field-processed').each(function(index, item) {
        // Get the settings for the map from the Drupal.settings object.
        var lat = $(this).attr('data-lat');
        var lon = $(this).attr('data-lon');
        var zoom = parseInt($(this).attr('data-zoom'));
        var type = $(this).attr('data-type');
        var show_controls = $(this).attr('data-controls-show') === "true";
        var routeIndex = 0;
        var flightPathArray = [];
        var routeCoords = toObj(settings.google_map_field.route['item'+index]);
        var markerCoords = toObj(settings.google_map_field.marker['item'+index]);
        var markerArray = [];
        var markerIndex = 0;
        var markerEditIndex = 0;
        var infoWindow = [];

        // Create the map coords and map options.
        var latlng = new google.maps.LatLng(lat, lon);
        var mapOptions = {
          zoom: zoom,
          center: latlng,
          streetViewControl: false,
          mapTypeId: type,
          disableDefaultUI: show_controls ? false : true,
        };

        var google_map_field_map = new google.maps.Map(this, mapOptions);

        google.maps.event.trigger(google_map_field_map, 'resize');

        routeCoords.forEach(function(path, index) {
          routeIndex = index;
          flightPathArray[routeIndex] = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: path[0].color,
            strokeOpacity: 1.0,
            strokeWeight: path[0].size
          });
          flightPathArray[routeIndex].setMap(google_map_field_map);
        });

        markerCoords.forEach(function(path, index) {
          markerIndex = index;
          markerEditIndex = index;

          infoWindow[index] = new google.maps.InfoWindow({
            content: path[0].notes
          });

          // drop a marker at the specified lat/lng coords
          markerArray[index] = new google.maps.Marker({
            position: path[0],
            optimized: false,
            draggable: false,
            visible: true,
            map: google_map_field_map,
            icon: path[0].flag
          });

          markerArray[index].addListener('click', function() {
            infoWindow[index].open(google_map_field_map, markerArray[index]);
          });
        });
      });

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
