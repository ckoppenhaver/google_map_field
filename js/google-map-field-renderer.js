
var google_map_field_map;

(function ($, Drupal) {

  Drupal.behaviors.google_map_field_renderer = {
    attach: function (context, settings) {

      $('.google-map-field .map-container').once('.google-map-field-processed').each(function(index, item) {
        // Get the settings for the map from the Drupal.settings object.
        var lat = $(this).attr('data-lat');
        var lon = $(this).attr('data-lon');
        var zoom = parseInt($(this).attr('data-zoom'));
        var type = $(this).attr('data-type');
        var show_marker = $(this).attr('data-marker-show') === "true";
        var show_controls = $(this).attr('data-controls-show') === "true";
        var info_window = $(this).attr('data-infowindow') === "true";
        var routeIndex = 0;
        var flightPathArray = [];
        var routeCoords = toObj(settings.google_map_field['item'+index]);

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

        // Drop a marker at the specified position.
        var marker = new google.maps.Marker({
          position: latlng,
          optimized: false,
          visible: show_marker,
          map: google_map_field_map
        });

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

        if (info_window) {
          var info_markup = $(this).parent().find('.map-infowindow').html();
          var infowindow = new google.maps.InfoWindow({
            content: info_markup
          });

          marker.addListener('click', function () {
            infowindow.open(google_map_field_map, marker);
          });
        }

      });

    }
  };

  toObj = function(thing) {
    var returnObj = [];
    try {
      thing = JSON.parse(thing);
      thing = $.map(thing, function(value, index) {
        return [value];
      });
      thing.forEach(function (pathSet, pathIndex){
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
