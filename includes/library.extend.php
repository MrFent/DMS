<?php
/**
 * Functions and actions related to PageLines Extension
 * 
 * @since 2.0.b9
 */

/**
 * Load 'child' styles, functions and templates.
 */	
add_action( 'wp_head', 'load_child_style', 20 );
function load_child_style() {

	if ( !defined( 'PL_CUSTOMIZE' ) )
		return;
		
	if ( file_exists( PL_EXTEND_STYLE_PATH ) ){

		$cache_ver = '?ver=' . pl_cache_version( PL_EXTEND_STYLE_PATH ); 
		
		pagelines_draw_css( PL_EXTEND_STYLE . $cache_ver, 'pl-extend-style' );
		
	}	
		
}

add_action( 'init', 'load_child_functions' );
function load_child_functions() {
	if ( !defined( 'PL_CUSTOMIZE' ) )
		return;

	if ( file_exists( PL_EXTEND_FUNCTIONS ) )
		require_once( PL_EXTEND_FUNCTIONS );
}

add_action( 'init', 'base_check_templates' );

function base_check_templates() {

	if ( is_child_theme() ) {
		foreach ( glob( get_stylesheet_directory() . '/*.php') as $file) {
			if ( preg_match( '/page\.([a-z-0-9]+)\.php/', $file, $match ) ) {
				$data = get_file_data( trailingslashit( get_stylesheet_directory() ) . basename( $file ), array( 'name' => 'Template Name' ) );
				if ( is_array( $data ) )
					pagelines_add_page( $match[1], $data['name'] );
			}	
		}
	}
	
	if ( !defined( 'PL_CUSTOMIZE' ) )
		return;

	foreach ( glob( EXTEND_CHILD_DIR . '/*.php') as $file) {

		if ( preg_match( '/page\.([a-z-0-9]+)\.php/', $file, $match ) ) {

			if ( !file_exists( trailingslashit( get_stylesheet_directory() ) . $file ) && is_writable( get_stylesheet_directory() ) ) 
				copy( $file, trailingslashit( get_stylesheet_directory() ) . basename( $file ) );

			if ( file_exists( trailingslashit( get_stylesheet_directory() ) . basename( $file ) ) ) {
				$data = get_file_data( trailingslashit( get_stylesheet_directory() ) . basename( $file ), array( 'name' => 'Template Name' ) );
				if ( is_array( $data ) )
					pagelines_add_page( $match[1], $data['name'] );
			}
		}
	}
}

function pagelines_try_api( $url, $options ) {
		
	$prot = array( 'https://', 'http://' );
		
	foreach( $prot as $type ) {	
		// sometimes wamp does not have curl!
		if ( $type === 'https://' && !function_exists( 'curl_init' ) )
			continue;	
		$r = wp_remote_post( $type . $url, $options );
			if ( !is_wp_error($r) && is_array( $r ) ) {
				return $r;				
			}
	}
	return false;
}

define( 'VDEV', ( pagelines_check_credentials( 'licence' ) === 'dev' ) ? true : false );