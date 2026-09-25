<?php
/**
 * Plugin Name: CarePortals Cart
 * Plugin URI: https://portals.care
 * Description: Embeds the CarePortals cart widget via the [care-portals-cart] shortcode.
 * Version: 2.0
 * Author: CarePortals
 * Author URI: https://portals.care
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Where the built cart assets are served from, with a trailing slash.
 * Define CARE_PORTALS_CART_URL in wp-config.php to point at your own CDN.
 */
function care_portals_cart_base_url() {
	if ( defined( 'CARE_PORTALS_CART_URL' ) ) {
		return trailingslashit( CARE_PORTALS_CART_URL );
	}

	return '';
}

/**
 * The organization id the cart sends as a request header.
 * Define CARE_PORTALS_ORGANIZATION in wp-config.php.
 */
function care_portals_cart_organization() {
	return defined( 'CARE_PORTALS_ORGANIZATION' ) ? CARE_PORTALS_ORGANIZATION : '';
}

function care_portals_cart_enqueue() {
	$base = care_portals_cart_base_url();

	if ( empty( $base ) ) {
		return;
	}

	wp_enqueue_script(
		'care-portals-cart',
		$base . 'scripts.js',
		array(),
		null,
		true
	);

	wp_add_inline_script(
		'care-portals-cart',
		'window.organization = ' . wp_json_encode( care_portals_cart_organization() ) . ';',
		'before'
	);
}
add_action( 'wp_enqueue_scripts', 'care_portals_cart_enqueue' );

function care_portals_cart_shortcode() {
	return "<div id='care-portals-cart'></div>";
}
add_shortcode( 'care-portals-cart', 'care_portals_cart_shortcode' );
