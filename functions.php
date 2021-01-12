<?php

add_action( 'rest_api_init', 'slug_register_rest_routes' );
function slug_register_rest_routes() {
    // contact
    register_rest_route(
    'theme/v2',
    '/contact_form/',
    array(
        'methods' => 'GET',
        'callback' => 'get_contact_form'
        )
    );
}

function get_contact_form() {
    return do_shortcode('[contact-form-7 id="2107" title="Contact"]');
}

/**
 * Get the terms of the media category
 *
 * @param array $object Details of current post.
 * @param string $field_name Name of field.
 * @param WP_REST_Request $request Current request
 *
 * @return mixed
 */
function slug_get_media_category_terms() {
      return get_terms( array(
                            'taxonomy' => 'category_media',
                            'hide_empty' => false,
                        ) );
}

/**
 * Get the terms of the media object
 *
 * @param array $object Details of current post.
 * @param string $field_name Name of field.
 * @param WP_REST_Request $request Current request
 *
 * @return mixed
 */
function slug_get_media_object_terms( $object, $field_name, $request ) {
      return wp_get_object_terms($object['id'], 'category_media');
}


?>
