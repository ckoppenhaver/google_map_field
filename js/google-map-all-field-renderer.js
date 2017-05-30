
var google_map_field_map;

(function ($, Drupal) {

  Drupal.behaviors.google_map_all_field_renderer = {
    attach: function (context, settings) {
      console.log('wheee');

      $('.google-map-field.map-all .map-container').once('.google-map-field-processed').each(function(index, item) {
        // Get the settings for the map from the Drupal.settings object.
        var routeAllArray = [];
        var markerAllArray = [];
        var indexTotal = 0;

        $.each(settings.google_map_field.all.marker, function(markerLoopIndex, markerLoopItems){
          markerTemp = toObj(settings.google_map_field.all.marker[markerLoopIndex]);
          $.each(markerTemp, function(markerLoopItemIndex, markerLoopItem){
            markerAllArray[indexTotal] = markerLoopItem[0];
            indexTotal++;
          });
        });

        indexTotal = 0;
        $.each(settings.google_map_field.all.route, function(routeLoopItemsIndex, routeLoopItems){
          routeTemp = toObj(settings.google_map_field.all.route[routeLoopItemsIndex]);
          $.each(routeTemp, function(routeLoopItemIndex, routeLoopItem){
            routeAllArray[indexTotal] = routeLoopItem;
            indexTotal++;
          });
        });

        var lat = $(this).attr('data-lat');
        var lon = $(this).attr('data-lon');
        var zoom = parseInt($(this).attr('data-zoom'));
        var type = $(this).attr('data-type');
        var show_controls = $(this).attr('data-controls-show') === "true";
        var routeIndex = 0;
        var flightPathArray = [];
        var routeCoords = routeAllArray;
        var markerCoords = markerAllArray;
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
            content: path.notes
          });

          // drop a marker at the specified lat/lng coords
          markerArray[index] = new google.maps.Marker({
            position: path,
            optimized: false,
            draggable: false,
            visible: true,
            map: google_map_field_map,
            icon: path.flag
          });

          markerArray[index].addListener('click', function() {
            infoWindow[index].open(google_map_field_map, markerArray[index]);
          });
        });
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
