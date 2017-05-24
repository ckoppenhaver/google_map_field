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
        var data_marker  = $('input[data-marker-delta="' + data_delta + '"]').val() === "1";


        var routeCoords = $('input[data-routepairs-delta="' + data_delta + '"]').val();
        var markerCoords = $('input[data-markerpairs-delta="' + data_delta + '"]').val();

        var routeIndex = 0;
        var routeEditIndex = 0;
        var flightPathArray = [];
        routeCoords = toObj(routeCoords);

        var markerArray = [];
        var markerIndex = 0;
        var markerEditIndex = 0;

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

        // drop a marker at the specified lat/lng coords
        // marker = new google.maps.Marker({
        //   position: latlng,
        //   optimized: false,
        //   visible: true,
        //   map: google_map_field_map
        // });


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

          console.log(index);
          markerIndex = index;
          markerEditIndex = index;

          // $('.route-path-listing').prepend(markerListingMarkerOptions(index));
          //
          //
          // $('.marker-listing-edit').prop('disabled', false);
          // $('.marker-listing-delete').prop('disabled', false);
          // $('.table-listing-item').removeClass('table-listing-active');

          // drop a marker at the specified lat/lng coords
          markerArray[index] = new google.maps.Marker({
            position: path[0],
            optimized: false,
            draggable: false,
            visible: true,
            map: google_map_field_map
          });
        });

        // if (markerArray[markerEditIndex] != undefined) {
        //   markerIndex++;
        //   markerEditIndex++;
        // }



        $('#map_setter_' + data_delta).unbind();
        $('#map_setter_' + data_delta).bind('click', function(event) {
          event.preventDefault();
          googleMapFieldSetter($(this).attr('data-delta'));
        });

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
