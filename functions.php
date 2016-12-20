<?php

add_action( 'rest_api_init', 'slug_register_media_categories' );
function slug_register_media_categories() {

    register_rest_field( 'attachment',
        'media_category_terms',
        array(
            'get_callback'    => 'slug_get_media_object_terms',
            'update_callback' => null,
            'schema'          => null,
        )
    );

    register_rest_route( 'theme/v2',
        '/media_category_terms/',
        array(
            'methods' => 'GET',
            'callback' => 'slug_get_media_category_terms'
        )
    );
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
function slug_get_media_category_terms( $object, $field_name, $request ) {
      return get_terms( 'category_media' );
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
