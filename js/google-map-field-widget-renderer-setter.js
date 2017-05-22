
(function ($) {

  var dialog;
  var google_map_field_map;
  var mapOptionState = 'set-marker';
  var routeCoords = [];

  googleMapFieldSetter = function(delta) {

    btns = {};

    btns[Drupal.t('Insert map')] = function () {
      var latlng = marker.position;
      var zoom = $('#edit-zoom').val();
      var type = $('#edit-type').val();
      var width = $('#edit-width').val();
      var height = $('#edit-height').val();
      var show_marker = $('#edit-marker').prop('checked') ? "1" : "0";
      var show_controls = $('#edit-controls').prop('checked') ? "1" : "0";
      var infowindow_text = $('#edit-infowindow').val();


      $('input[data-lat-delta="' + delta + '"]').prop('value', latlng.lat()).attr('value', latlng.lat());
      $('input[data-lon-delta="' + delta + '"]').prop('value', latlng.lng()).attr('value', latlng.lng());
      $('input[data-zoom-delta="' + delta + '"]').prop('value', zoom).attr('value', zoom);
      $('input[data-type-delta="' + delta + '"]').prop('value', type).attr('value', type);
      $('input[data-width-delta="' + delta + '"]').prop('value', width).attr('value', width);
      $('input[data-height-delta="' + delta + '"]').prop('value', height).attr('value', height);
      $('input[data-marker-delta="' + delta + '"]').prop('value', show_marker).attr('value', show_marker);
      $('input[data-controls-delta="' + delta + '"]').prop('value', show_controls).attr('value', show_controls);
      $('input[data-infowindow-delta="' + delta + '"]').prop('value', infowindow_text).attr('value', infowindow_text);
      $('textarea[data-routepairs-delta="' + delta + '"]').prop('value', toString(routeCoords));

      googleMapFieldPreviews(delta);

      $(this).dialog("close");
    };

    btns[Drupal.t('Cancel')] = function () {
      $(this).dialog("close");
    };

    var dialogHTML = '';
    dialogHTML += '<div id="google_map_field_dialog">';
    dialogHTML += '  <div>' + Drupal.t('Use the map below to drop a marker at the required location.') + '</div>';
    dialogHTML += '  <div id="google_map_field_container">';
    dialogHTML += '    <div id="google_map_map_container">';
    dialogHTML += '      <div id="centre_on">';
    dialogHTML += '        <label>' + Drupal.t('Enter an address/town/postcode, etc., to center the map on:') + '</label><input size="50" type="text" name="centre_map_on" id="centre_map_on" value=""/>';
    dialogHTML += '        <button onclick="return doCentre();" type="button" role="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only button">' + Drupal.t('Find') + '</button>';
    dialogHTML += '        <div id="map_error"></div>';
    dialogHTML += '        <div id="centre_map_results"></div>';
    dialogHTML += '      </div>';
    dialogHTML += '      <div id="gmf_container"></div>';
    dialogHTML += '      <table class="route-path-listing">';
    dialogHTML += '      </table>';
    dialogHTML += '      <div id="infowindow_container">';
    dialogHTML += '        <label for="edit-infowindow">' + Drupal.t('InfoWindow Popup text: (optional)') + '</label>';
    dialogHTML += '        <textarea class="form-textarea" id="edit-infowindow" name="infowindow" rows="5" cols="70"></textarea>';
    dialogHTML += '      </div>';
    dialogHTML += '    </div>';
    dialogHTML += '    <div id="google_map_field_options">';
    dialogHTML += '      <label for="edit-zoom">Map Zoom</label>';
    dialogHTML += '      <select class="form-select" id="edit-zoom" name="field_zoom"><option value="1">1 (Min)</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9 (Default)</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option>option value="21">21 (Max)</option></select>';
    dialogHTML += '      <label for="edit-type">Map Type</label>';
    dialogHTML += '      <select class="form-select" id="edit-type" name="field_type"><option value="roadmap">Map</option><option value="satellite">Satellite</option><option value="hybrid">Hybrid</option><option value="terrain">Terrain</option></select>';
    dialogHTML += '      <label for="edit-width">Map Width</label>';
    dialogHTML += '      <input type="text" id="edit-width" size="5" maxlength="6" name="field-width" value="" />';
    dialogHTML += '      <label for="edit-height">Map Height</label>';
    dialogHTML += '      <input type="text" id="edit-height" size="5" maxlength="6" name="field-height" value="" />';
    dialogHTML += '      <label for="edit-controls">Enable controls</label>';
    dialogHTML += '      <input type="checkbox" class="form-checkbox" id="edit-controls" name="field_controls" />';
    dialogHTML += '      <label for="edit-marker">Enable marker</label>';
    dialogHTML += '      <input type="checkbox" class="form-checkbox" id="edit-marker" name="field_marker" />';
    dialogHTML += '      <label>' + Drupal.t('Map Actions') + '</label>';
    dialogHTML += '      <button disabled type="button" role="button" name="set-marker" id="set-marker" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only button map-option-button">' + Drupal.t('Set Markers') + '</button>';
    dialogHTML += '      <button type="button" role="button" name="set-route" id="set-route" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only button map-option-button">' + Drupal.t('Set Route') + '</button>';
    dialogHTML += '    </div>';
    dialogHTML += '  </div>';
    dialogHTML += '</div>';

    $('body').append(dialogHTML);

    dialog = $('#google_map_field_dialog').dialog({
      modal: true,
      autoOpen: false,
      width: 800,
      height: 640,
      closeOnEscape: true,
      resizable: false,
      draggable: false,
      title: Drupal.t('Set Map Marker'),
      dialogClass: 'jquery_ui_dialog-dialog',
      buttons: btns,
      close: function(event, ui) {
        $(this).dialog('destroy').remove();
      }
    });

    dialog.dialog('open');

    // Handle map options inside dialog.
    $('#edit-zoom').change(function() {
      google_map_field_map.setZoom(googleMapFieldValidateZoom($(this).val()));
    });
    $('#edit-type').change(function() {
      google_map_field_map.setMapTypeId($(this).val());
    });
    $('#edit-controls').change(function() {
      google_map_field_map.setOptions({disableDefaultUI : !$(this).prop('checked')});
    });
    $('#edit-marker').change(function() {
      marker.setVisible($(this).prop('checked'));
    });

    // Create the map setter map.
    // get the lat/lon from form elements
    var lat = $('input[data-lat-delta="' + delta + '"]').attr('value');
    var lon = $('input[data-lon-delta="' + delta + '"]').attr('value');
    var zoom = $('input[data-zoom-delta="' + delta + '"]').attr('value');
    var type = $('input[data-type-delta="' + delta + '"]').attr('value');
    var width = $('input[data-width-delta="' + delta + '"]').attr('value');
    var height = $('input[data-height-delta="' + delta + '"]').attr('value');
    var show_marker = $('input[data-marker-delta="' + delta + '"]').val() === "1";
    var show_controls = $('input[data-controls-delta="' + delta + '"]').val() === "1";
    var infowindow_text = $('input[data-infowindow-delta="' + delta + '"]').attr('value');
    routeCoords = $('textarea[data-routepairs-delta="' + delta + '"]').val();
    var routeCoordsTemp = [];
    var routeIndex = 0;
    var routeEditIndex = 0;
    var flightPathArray = [];

    routeCoords = toObj(routeCoords);

    lat = googleMapFieldValidateLat(lat);
    lon = googleMapFieldValidateLon(lon);
    zoom = googleMapFieldValidateZoom(zoom);

    $('#edit-zoom').val(zoom);
    $('#edit-type').val(type);
    $('#edit-width').prop('value', width).attr('value', width);
    $('#edit-height').prop('value', height).attr('value', height);
    $('#edit-marker').prop('checked', show_marker);
    $('#edit-controls').prop('checked', show_controls);
    $('#edit-infowindow').val(infowindow_text);

    // $('#edit-controls').prop('checked', controls);

    var latlng = new google.maps.LatLng(lat, lon);
    var mapOptions = {
      zoom: parseInt(zoom),
      center: latlng,
      streetViewControl: false,
      mapTypeId: type,
      disableDefaultUI: show_controls ? false : true,
      disableDoubleClickZoom: true
    };
    google_map_field_map = new google.maps.Map(document.getElementById("gmf_container"), mapOptions);
    routeCoords.forEach(function(path, index) {

      routeIndex = index;
      routeEditIndex = index;

      $('.route-path-listing').prepend(routeListingRouteOptions(index));
      $('.route-listing-done').prop('disabled', 'disabled');
      $('.route-listing-undo').prop('disabled', 'disabled');
      $('.route-listing-edit').prop('disabled', false);
      $('.table-listing-item').removeClass('table-listing-active');

      var activeRow = $(".route-path-listing").find("[data-route-index='" + routeEditIndex + "']");
      $('.route-listing-color', activeRow).val(path[0].color);

      flightPathArray[routeEditIndex] = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: path[0].color,
        strokeOpacity: 1.0,
        strokeWeight: path[0].size
      });
      flightPathArray[routeEditIndex].setMap(google_map_field_map);
    });

    if (flightPathArray[routeEditIndex] != undefined) {
      routeIndex++;
      routeEditIndex++;
    }


    // Add map listener
    google.maps.event.addListener(google_map_field_map, 'zoom_changed', function() {
      $('#edit-zoom').val(google_map_field_map.getZoom());
    });

    // drop a marker at the specified lat/lng coords
    marker = new google.maps.Marker({
      position: latlng,
      optimized: false,
      draggable: true,
      visible: show_marker,
      map: google_map_field_map
    });

    // add a click listener for marker placement
    google.maps.event.addListener(google_map_field_map, "click", function(event) {
      if (mapOptionState == 'set-marker') {
        latlng = event.latLng;
        google_map_field_map.panTo(latlng);
        marker.setMap(null);
        marker = new google.maps.Marker({
          position: latlng,
          optimized: false,
          draggable: true,
          visible: $('#edit-marker').prop('checked'),
          map: google_map_field_map
        });
      }
      else if (mapOptionState == 'set-route') {

        // Add a entry to our route listing section.
        if (routeCoords[routeEditIndex] == undefined) {
          $('.table-listing-item').removeClass('table-listing-active');
          $('.route-listing-edit').prop('disabled', true);
          $('.route-listing-undo').prop('disabled', 'disabled');

          $('.route-listing-done').prop('disabled', 'disabled');
          $('.route-listing-delete').prop('disabled', 'disabled');

          $('.route-path-listing').prepend(routeListingRouteOptions(routeEditIndex));

          $('.route-listing-color').prop('disabled', false);
          $('.route-listing-size').prop('disabled', false);
        }

        // routeColor =
        var activeRow = $(".route-path-listing").find("[data-route-index='" + routeEditIndex + "']");
        var routeColor = $('.route-listing-color', activeRow).val();
        var routeSize = $('.route-listing-size', activeRow).val();

        routeCoordsTemp.forEach(function(routeCoords, routeCoordsIndex) {
          routeCoordsTemp[routeCoordsIndex].color = routeColor;
          routeCoordsTemp[routeCoordsIndex].size = routeSize;
        });

        // Push a route to our route temp object.
        routeCoordsTemp.push({lat: event.latLng.lat(), lng: event.latLng.lng(), color: routeColor, size: routeSize});
        routeCoords[routeEditIndex] = routeCoordsTemp;

        if (flightPathArray[routeEditIndex] != undefined) {
          flightPathArray[routeEditIndex].setMap(null);
        }
        flightPathArray[routeEditIndex] = new google.maps.Polyline({
          path: routeCoords[routeEditIndex],
          geodesic: true,
          strokeColor: routeColor,
          strokeOpacity: 1.0,
          strokeWeight: routeSize
        });
        flightPathArray[routeEditIndex].setMap(google_map_field_map);

      }
    });
    google.maps.event.addListener(marker, 'dragend', function(event) {
      google_map_field_map.panTo(event.latLng);
    });


    // Toggle between setting markers and routes
    $('.map-option-button').on('click', function() {
      $('.map-option-button').prop('disabled', false);
      $(this).prop('disabled', 'disabled');
      mapOptionState = $(this).attr('id');
    });

    // Edit route
    $('.route-path-listing').on('click', '.route-listing-edit', function() {
      var selectedEditRow = $(this).closest('tr');
      routeEditIndex = selectedEditRow.data('route-index');
      routeCoordsTemp = routeCoords[routeEditIndex];
      $('.route-listing-edit').prop('disabled', 'disabled');
      $('.route-listing-done').prop('disabled', 'disabled');
      $('.route-listing-undo').prop('disabled', 'disabled');
      $('.route-listing-delete').prop('disabled', 'disabled');
      $('.route-listing-color').prop('disabled', 'disabled');
      $('.route-listing-size').prop('disabled', 'disabled');

      $('button', selectedEditRow).prop('disabled', false);
      $('select', selectedEditRow).prop('disabled', false);
      $('.route-listing-edit', selectedEditRow).prop('disabled', 'disabled');

      $('.table-listing-item').removeClass('table-listing-active');

      selectedEditRow.addClass('table-listing-active');

    });
    // Finish editing the route
    $('.route-path-listing').on('click', '.route-listing-done', function() {
      $('.route-listing-edit').prop('disabled', false);
      $('.route-listing-undo').prop('disabled', 'disabled');
      $('.route-listing-delete').prop('disabled', false);
      $('.route-listing-done').prop('disabled', 'disabled');
      $('.route-listing-color').prop('disabled', 'disabled');
      $('.route-listing-size').prop('disabled', 'disabled');
      $('.table-listing-item').removeClass('table-listing-active');

      if (routeIndex == routeEditIndex) {

        routeIndex++;
        routeEditIndex++;
      }
      else {
        routeEditIndex = routeIndex;
      }
      routeCoordsTemp = [];

    });

    $('.route-path-listing').on('click', '.route-listing-undo', function() {
      routeCoords[routeEditIndex].pop();
      flightPathArray[routeEditIndex].setMap(null);
      flightPathArray[routeEditIndex] = new google.maps.Polyline({
        path: routeCoords[routeEditIndex],
        geodesic: true,
        strokeColor: routeCoords[routeEditIndex][0].color,
        strokeOpacity: 1.0,
        strokeWeight: routeCoords[routeEditIndex][0].size
      });
      flightPathArray[routeEditIndex].setMap(google_map_field_map);
    });

    $('.route-path-listing').on('click', '.route-listing-delete', function() {
      var selectedEditRow = $(this).closest('tr');
      routeEditIndex = selectedEditRow.data('route-index');
      flightPathArray[routeEditIndex].setMap(null);
      routeCoords[routeEditIndex] = null;
      $('.route-listing-done').click();
      selectedEditRow.remove();
    });

    $('.route-path-listing').on('change', '.route-listing-color', function() {
      // routeCoords[routeEditIndex].pop();



      var selectedEditRow = $(this).closest('tr');
      var routeColor = $('.route-listing-color', selectedEditRow).val();


      routeCoords[routeEditIndex].forEach(function(routeCoordsitem, routeCoordsIndex) {
        routeCoords[routeEditIndex][routeCoordsIndex].color = routeColor;
      });

      flightPathArray[routeEditIndex].setMap(null);
      flightPathArray[routeEditIndex] = new google.maps.Polyline({
        path: routeCoords[routeEditIndex],
        geodesic: true,
        strokeColor: routeCoords[routeEditIndex][0].color,
        strokeOpacity: 1.0,
        strokeWeight: routeCoords[routeEditIndex][0].size
      });
      flightPathArray[routeEditIndex].setMap(google_map_field_map);
    });


    $('.route-path-listing').on('change', '.route-listing-size', function() {
      // routeCoords[routeEditIndex].pop();



      var selectedEditRow = $(this).closest('tr');
      var routeSize = $('.route-listing-size', selectedEditRow).val();


      routeCoords[routeEditIndex].forEach(function(routeCoordsitem, routeCoordsIndex) {
        routeCoords[routeEditIndex][routeCoordsIndex].size = routeSize;
      });

      flightPathArray[routeEditIndex].setMap(null);
      flightPathArray[routeEditIndex] = new google.maps.Polyline({
        path: routeCoords[routeEditIndex],
        geodesic: true,
        strokeColor: routeCoords[routeEditIndex][0].color,
        strokeOpacity: 1.0,
        strokeWeight: routeCoords[routeEditIndex][0].size
      });
      flightPathArray[routeEditIndex].setMap(google_map_field_map);
    });

    return false;
  };

  doCentreLatLng = function(lat, lng) {
    var latlng = new google.maps.LatLng(lat, lng);
    google_map_field_map.panTo(latlng);
    marker.setMap(null);
    marker = new google.maps.Marker({
      position: latlng,
      draggable: true,
      visible: $('#edit-marker').prop('checked'),
      map: google_map_field_map
    });
    google.maps.event.addListener(marker, 'dragend', function(event) {
      google_map_field_map.panTo(event.latLng);
    });
  };

  doCentre = function() {
    var centreOnVal = $('#centre_map_on').val();

    if (centreOnVal == '' || centreOnVal == null) {
      $('#centre_map_on').css("border", "1px solid red");
      $('#map_error').html(Drupal.t('Enter a value in the field provided.'));
      return false;
    }
    else {
      $('#centre_map_on').css("border", "1px solid lightgrey");
      $('#map_error').html('');
    }

    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': centreOnVal}, function (result, status) {
      $('#centre_map_results').html('');
      if (status == 'OK') {
        doCentreLatLng(result[0].geometry.location.lat(), result[0].geometry.location.lng());
        $('#centre_map_results').html(Drupal.formatPlural(result.length, 'One result found.', '@count results found: '));

        if (result.length > 1) {
          for (var i = 0; i < result.length; i++) {
            var lat = result[i].geometry.location.lat();
            var lng = result[i].geometry.location.lng();
            var link = $('<a onclick="return doCentreLatLng(' + lat + ',' + lng + ');">' + (i + 1) + '</a>');
            $('#centre_map_results').append(link);
          }
        }

      } else {
        $('#map_error').html(Drupal.t('Could not find location.'));
      }
    });

    return false;

  };

  toString = function(obj){
    var returnArray = [];
    obj.forEach(function(route, routeIndex) {
      if(route) {
        route.forEach(function(coordPair, coordPairIndex){
          route[coordPairIndex] = JSON.stringify(coordPair);
        });
        returnArray.push(route);
      }
    });

    var temp = obj.reduce(function(acc, cur, i) {
      acc[i] = cur;
      return acc;
    }, {});
    return JSON.stringify(temp);
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

  routeListingRouteOptions = function(index) {
    var tableRow = '<tr data-route-index="' + index + '" class="table-listing-item table-listing-active">';
    tableRow += '<td>Route' + (index + 1) + '</td>';
    tableRow += '<td><button disabled type="button" role="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only button route-listing-edit">' + Drupal.t('Edit') + '</button></td>';
    tableRow += '<td><button type="button" role="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only button route-listing-done">' + Drupal.t('Done') + '</button></td>';
    tableRow += '<td><button type="button" role="button" name="set-route" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only button route-listing-undo">' + Drupal.t('Undo') + '</button></td>';
    tableRow += '<td><button type="button" role="button" name="set-route" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only button route-listing-delete">' + Drupal.t('Delete') + '</button></td>';
    tableRow += '<td><select disabled class="route-listing-color">';
    tableRow += '<option value="red">Red</option>';
    tableRow += '<option value="yellow">Yellow</option>';
    tableRow += '<option value="green">Green</option>';
    tableRow += '<option value="blue">Blue</option>';
    tableRow += '</select></td>';
    tableRow += '<td><select disabled class="route-listing-size">';
    tableRow += '<option value="1">1</option>';
    tableRow += '<option value="2">2</option>';
    tableRow += '<option value="3">3</option>';
    tableRow += '<option value="4">4</option>';
    tableRow += '<option value="5">5</option>';
    tableRow += '<option value="6">6</option>';
    tableRow += '<option value="7">7</option>';
    tableRow += '<option value="8">8</option>';
    tableRow += '<option value="9">9</option>';
    tableRow += '<option value="10">10</option>';
    tableRow += '</select></td>';
    tableRow += '</tr>';

    return tableRow;
  };

})(jQuery);
