<?php

namespace Drupal\google_map_field\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'Google Map All markers and routes' Block.
 *
 * @Block(
 *   id = "google_map_all_points",
 *   admin_label = @Translation("Google Map all markers and routes block"),
 * )
 */
class GoogleMapAllPointsBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $query = \Drupal::database()->select('node__field_maps', 'nfm');
    $query->fields('nfm', ['entity_id', 'field_maps_name', 'field_maps_lat', 'field_maps_lon', 'field_maps_zoom', 'field_maps_type', 'field_maps_marker', 'field_maps_controls', 'field_maps_width', 'field_maps_height', 'field_maps_routepairs', 'field_maps_markerpairs']);
    $query->join('node_field_data', 'nfd', 'nfd.nid = nfm.entity_id');
    $query->condition('nfd.status', '1');


    $maps = $query->execute()->fetchAllAssoc('entity_id');
    $elements = [];
    $index = 0;

    $element = [
      '#theme' => 'google_map_field',
      '#name' => "",
      '#lat' => "64.098813071013",
      '#lon' => "-150.71678170625",
      '#zoom' => "4",
      '#type' => "terrain",
      '#show_marker' => "true",
      '#show_controls' => "true",
      '#width' => "100%",
      '#height' => "450px",
      '#custom_class' => 'map-all',
    ];

    foreach ($maps as $delta => $item) {
      $element['#attached']['library'][] = 'google_map_field/google-map-field-renderer';
      $element['#attached']['library'][] = 'google_map_field/google-map-apis';
      $element['#attached']['drupalSettings']['google_map_field']['all']['route']['item'.$index] = $item->field_maps_routepairs;
      $element['#attached']['drupalSettings']['google_map_field']['all']['marker']['item'.$index] = $item->field_maps_markerpairs;
      $index++;
    }

    $elements[] = $element;
    return $elements;
  }

}