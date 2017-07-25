(function ($, Drupal) {

  googleMapFieldPreviews = function(delta) {

    delta = typeof delta === 'undefined' ? -1 : delta;

    $('.google-map-field-preview').each(function() {
      var data_delta = $(this).attr('data-delta');

      if (data_delta == delta || delta == -1) {

        var data_lat   = $('input[data-lat-delta="' + data_delta + '"]').val();
        var data_lon   = $('input[data-lon-delta="' + data_delta + '"]').val();
        var data_zoom  = $('input[data-zoom-delta="' + data_delta + '"]').attr('value');
        var data_type  = $('input[data-type-delta="' + data_delta + '"]').attr('value');
        var routeCoords = $('input[data-routepairs-delta="' + data_delta + '"]').val();
        var markerCoords = $('input[data-markerpairs-delta="' + data_delta + '"]').val();
        var routeIndex = 0;
        var routeEditIndex = 0;
        var flightPathArray = [];
        routeCoords = toObj(routeCoords);
        var markerArray = [];
        var markerIndex = 0;
        var markerEditIndex = 0;
        var infoWindow = [];
        var LatLngList = [];
        var markersSet = 0;

        markerCoords = toObj(markerCoords);

        data_lat = googleMapFieldValidateLat(data_lat);
        data_lon = googleMapFieldValidateLon(data_lon);
        data_zoom = googleMapFieldValidateZoom(data_zoom);

        var latlng = new google.maps.LatLng(data_lat, data_lon);

        // Create the map preview.
        var mapOptions = {
          zoom: parseInt(data_zoom),
          center: latlng,
          mapTypeId: data_type,
          draggable: false,
          zoomControl: false,
          scrollwheel: false,
          disableDoubleClickZoom: true,
          disableDefaultUI: true
        };
        google_map_field_map = new google.maps.Map(this, mapOptions);

        routeCoords.forEach(function(path, index) {
          routeIndex = index;
          routeEditIndex = index;
          flightPathArray[routeEditIndex] = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: path[0].color,
            strokeOpacity: 1.0,
            strokeWeight: path[0].size
          });
          flightPathArray[routeEditIndex].setMap(google_map_field_map);
        });

        markerCoords.forEach(function(path, index) {
          markerIndex = index;
          markerEditIndex = index;

          LatLngList.push(new google.maps.LatLng (path[0].lat, path[0].lng));
          markersSet++;

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

        $('#map_setter_' + data_delta).unbind();
        $('#map_setter_' + data_delta).bind('click', function(event) {
          event.preventDefault();
          googleMapFieldSetter($(this).attr('data-delta'));
        });
      }
      latlngbounds = new google.maps.LatLngBounds();
      LatLngList.forEach(function(latLngNew){
        latlngbounds.extend(latLngNew);
      });

      if (markersSet > 0) {
        google_map_field_map.setCenter(latlngbounds.getCenter());
      }
      if (markersSet > 1){
        google_map_field_map.fitBounds(latlngbounds);
      }
    });  // end .each

  };

  googleMapFieldValidateLat = function(lat) {
    lat = parseFloat(lat);
    if (lat >= -90 && lat <= 90) {
      return lat;
    }
    else {
      return '61.5997222';
    }
  };

  googleMapFieldValidateLon = function(lon) {
    lon = parseFloat(lon);
    if (lon >= -180 && lon <= 180) {
      return lon;
    }
    else {
      return '-149.1127778';
    }
  };

  googleMapFieldValidateZoom = function(zoom) {
    zoom = parseInt(zoom);
    if (zoom === null || zoom === '' || isNaN(zoom)) {
      return '4';
    }
    else {
      return zoom;
    }
  }

})(jQuery);
