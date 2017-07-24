<?php

namespace Drupal\google_map_field\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Block\BlockPluginInterface;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a 'Google Map All markers and routes' Block.
 *
 * @Block(
 *   id = "google_map_all_points",
 *   admin_label = @Translation("Google Map all markers and routes block"),
 * )
 */
class GoogleMapAllPointsBlock extends BlockBase  implements BlockPluginInterface {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $query = \Drupal::database()->select('node__field_map', 'nfm');
    $query->fields('nfm', ['entity_id', 'field_map_name', 'field_map_lat', 'field_map_lon', 'field_map_zoom', 'field_map_type', 'field_map_marker', 'field_map_controls', 'field_map_width', 'field_map_height', 'field_map_routepairs', 'field_map_markerpairs']);
    $query->join('node_field_data', 'nfd', 'nfd.nid = nfm.entity_id');
    $query->condition('nfd.status', '1');
    $maps = $query->execute()->fetchAllAssoc('entity_id');
    $elements = [];
    $index = 0;
    $term_list = array(
      'all' => $this->t('All'),
    );
    $config = $this->getConfiguration();

    if ($config['google_map_field_show_region_selector']) {
      $vocabTerms = \Drupal::service('entity_type.manager')->getStorage('taxonomy_term')->loadByProperties([
        'vid' => 'regions'
      ]);
      foreach ($vocabTerms as $term) {
        $term_list[$term->id()] = $term->getName();
      }
    }

    $element = [
      '#theme' => 'google_map_field',
      '#name' => "",
      '#lat' => $config['google_map_field_default_lat'],
      '#lon' => $config['google_map_field_default_lon'],
      '#zoom' => "4",
      '#type' => "terrain",
      '#show_marker' => "true",
      '#show_controls' => "true",
      '#width' => "100%",
      '#height' => "450px",
      '#custom_class' => 'map-all',
      '#regions' => $term_list,
      '#region_selector' => ($config['google_map_field_show_region_selector'] ? TRUE : FALSE),
    ];

    $element['#attached']['library'][] = 'google_map_field/google-map-field-renderer';
    $element['#attached']['library'][] = 'google_map_field/google-map-apis';

    $element['#attached']['drupalSettings']['google_map_field']['all']['config']['marker'] = ($config['google_map_field_show_marker'] ? TRUE : FALSE);
    $element['#attached']['drupalSettings']['google_map_field']['all']['config']['route'] = ($config['google_map_field_show_route'] ? TRUE : FALSE);
    $element['#attached']['drupalSettings']['google_map_field']['all']['config']['tooltip'] = ($config['google_map_field_show_tooltip'] ? TRUE : FALSE);
    $element['#attached']['drupalSettings']['google_map_field']['all']['config']['region_selector'] = ($config['google_map_field_show_region_selector'] ? TRUE : FALSE);

    foreach ($maps as $delta => $item) {

      $stop = '';
      $element['#attached']['drupalSettings']['google_map_field']['all']['route']['item'.$index] = $item->field_map_routepairs;
      $element['#attached']['drupalSettings']['google_map_field']['all']['marker']['item'.$index] = $item->field_map_markerpairs;

      $node = \Drupal::entityTypeManager()->getStorage('node')->load($item->entity_id);



      $element['#attached']['drupalSettings']['google_map_field']['all']['regions']['item'.$index] = $node->get('field_region')->getValue()[0]['target_id'];
        $index++;
    }

    $stop = '';
    $elements[] = $element;
    return $elements;
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);

    $config = $this->getConfiguration();

    $form['google_map_field_show_marker'] = array(
      '#type' => 'checkbox',
      '#title' => $this->t('Show Markers?'),
      '#description' => $this->t('Checking this will show markers on the map'),
      '#default_value' => isset($config['google_map_field_show_marker']) ? $config['google_map_field_show_marker'] : FALSE,
    );

    $form['google_map_field_show_route'] = array(
      '#type' => 'checkbox',
      '#title' => $this->t('Show Routes?'),
      '#description' => $this->t('Checking this will show Routes on the map'),
      '#default_value' => isset($config['google_map_field_show_route']) ? $config['google_map_field_show_route'] : FALSE,
    );

    $form['google_map_field_show_tooltip'] = array(
      '#type' => 'checkbox',
      '#title' => $this->t('Show marker tooltips?'),
      '#description' => $this->t('Checking this will show marker tooltips on the map'),
      '#default_value' => isset($config['google_map_field_show_tooltip']) ? $config['google_map_field_show_tooltip'] : FALSE,
    );

    $form['google_map_field_show_region_selector'] = array(
      '#type' => 'checkbox',
      '#title' => $this->t('Show Region Selector?'),
      '#description' => $this->t('Checking this will show the region selector on the map'),
      '#default_value' => isset($config['google_map_field_show_region_selector']) ? $config['google_map_field_show_region_selector'] : FALSE,
    );

    $form['google_map_field_default_lat'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Default Latitude  '),
      '#description' => $this->t('The default Latitude  value for the map'),
      '#default_value' => isset($config['google_map_field_default_lat']) ? $config['google_map_field_default_lat'] : '64.098813071013',
    );

    $form['google_map_field_default_lon'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Default Longitude '),
      '#description' => $this->t('The default Longitude value for the map'),
      '#default_value' => isset($config['google_map_field_default_lon']) ? $config['google_map_field_default_lon'] : '-150.71678170625',
    );

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    parent::blockSubmit($form, $form_state);
    $values = $form_state->getValues();
    $this->configuration['google_map_field_show_marker'] = $values['google_map_field_show_marker'];
    $this->configuration['google_map_field_show_route'] = $values['google_map_field_show_route'];
    $this->configuration['google_map_field_show_tooltip'] = $values['google_map_field_show_tooltip'];
    $this->configuration['google_map_field_show_region_selector'] = $values['google_map_field_show_region_selector'];
  }
}
