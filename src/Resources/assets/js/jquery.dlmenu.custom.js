/**
 * jquery.dlmenu.js v1.0.1
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
;( function( $, window, undefined ) {

	'use strict';

	// global
	var Modernizr = window.Modernizr, $body = $( 'body' );

	$.DLMenu = function( options, element ) {
		this.$el = $( element );
		this._init( options );
	};

	// the options
	$.DLMenu.defaults = {
		// classes for the animation effects
		animationClasses : { classin : 'dl-animate-in-left', classout : 'dl-animate-out-left' },
		// callback: click a link that has a sub menu
		// el is the link element (li); name is the level name
		onLevelClick : function( el, name ) { return false; },
		// callback: click a link that does not have a sub menu
		// el is the link element (li); ev is the event obj
		onLinkClick : function( el, ev ) { return false; },

		isActive : function( el, ev ) { return true; }
	};

	$.DLMenu.prototype = {
		_init : function( options ) {

			// options
			this.options = $.extend( true, {}, $.DLMenu.defaults, options );
			// cache some elements and initialize some variables
			this._config();
			
			var animEndEventNames = {
					'WebkitAnimation' : 'webkitAnimationEnd',
					'OAnimation' : 'oAnimationEnd',
					'msAnimation' : 'MSAnimationEnd',
					'animation' : 'animationend'
				},
				transEndEventNames = {
					'WebkitTransition' : 'webkitTransitionEnd',
					'MozTransition' : 'transitionend',
					'OTransition' : 'oTransitionEnd',
					'msTransition' : 'MSTransitionEnd',
					'transition' : 'transitionend'
				};
			// animation end event name
			this.animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ] + '.dlmenu';
			// transition end event name
			this.transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ] + '.dlmenu',
			// support for css animations and css transitions
			this.supportAnimations = Modernizr.cssanimations,
			this.supportTransitions = Modernizr.csstransitions;

			this._initEvents();
		},
		_config : function() {
			this.open = false;
			this.$trigger = this.$el.children( '.dl-trigger' );
			this.$menu = this.$el.find( 'ul.dl-menu' );
			this.$menuitems = this.$menu.find( 'li' ).not('.dl-back');
			this.$el.find( 'ul.dl-submenu' ).each(function (i, submenu) {
				var $submenu = $(submenu);
				if (0 === $submenu.children('.dl-back').length) {
                    $submenu.prepend('<li class="dl-back not-item-menu"><a href="#" class="back">Назад</a></li>');
				}
            });
		},
		_initEvents : function() {

			var self = this;

			this.$trigger.on( 'click.dlmenu', function() {

				if( self.open ) {
					self._closeMenu();
				} 
				else {
					self._openMenu();
				}
				return false;

			} );

			this.$el.on('click.dlmenu', 'li:not(.not-item-menu)', function( event ) {
                if (event.target && $(event.target).hasClass('not-item-menu')) {
                    return;
                }

				var $item = $(this),
					$submenu = $item.children( 'ul.dl-submenu' );

                if (!self.options.isActive($item, event)) {
                    return;
                }

                event.stopPropagation();

				if( $submenu.length > 0 ) {

					var $flyin = $submenu.clone().css({'opacity': 0}).attr('data-name', self.$menu.attr('data-name')).insertAfter( self.$menu ),
						onAnimationEndFn = function() {
							self.$menu.off( self.animEndEventName ).removeClass( self.options.animationClasses.classout ).addClass( 'dl-subview' );
							$item.addClass( 'dl-subviewopen' ).parents( '.dl-subviewopen:first' ).removeClass( 'dl-subviewopen' ).addClass( 'dl-subview' );
							$flyin.remove();
						};

					if ($item.hasClass('show-less')) {
						$flyin.addClass('show-less')
					} else if ($item.hasClass('show-more')) {
                        $flyin.addClass('show-more')
                    }

					setTimeout( function() {
						$flyin.css({'opacity': 1}).addClass( self.options.animationClasses.classin );
						self.$menu.addClass( self.options.animationClasses.classout );
						if( self.supportAnimations ) {
							self.$menu.on( self.animEndEventName, onAnimationEndFn );
						}
						else {
							onAnimationEndFn.call();
						}

						self.options.onLevelClick( $item, $item.children( 'a:first' ).text() );
					} );

					return false;

				}
				else {
					self.options.onLinkClick( $item, event );
				}

			} );

			this.$el.on('click.dlmenu', 'li.dl-back', function(event) {
				if (event.target && $(event.target).hasClass('not-back')) {
					return;
				}

				var $this = $(this),
					$submenu = $this.parents('ul.dl-submenu:first'),
					$item = $submenu.parent(),
					$flyin = $submenu.clone().css({'opacity': 0}).attr('data-name', self.$menu.attr('data-name')).insertAfter( self.$menu );

                if ($item.hasClass('show-less')) {
                    $flyin.addClass('show-less')
                } else if ($item.hasClass('show-more')) {
                    $flyin.addClass('show-more')
                }

				var onAnimationEndFn = function() {
					self.$menu.off( self.animEndEventName ).removeClass( self.options.animationClasses.classin );
					$flyin.remove();
				};

				setTimeout( function() {
					$flyin.css({'opacity': 1}).addClass( self.options.animationClasses.classout );
					self.$menu.addClass( self.options.animationClasses.classin );
					if( self.supportAnimations ) {
						self.$menu.on( self.animEndEventName, onAnimationEndFn );
					}
					else {
						onAnimationEndFn.call();
					}

					$item.removeClass( 'dl-subviewopen' );

					var $subview = $this.parents( '.dl-subview:first' );
					if( $subview.is( 'li' ) ) {
						$subview.addClass( 'dl-subviewopen' );
					}
					$subview.removeClass( 'dl-subview' );
				} );

				return false;

			} );

		},
		closeMenu : function() {
			if( this.open ) {
				this._closeMenu();
			}
		},
		_closeMenu : function() {
			var self = this,
				onTransitionEndFn = function() {
					self.$menu.off( self.transEndEventName );
					self._resetMenu();
				};
			
			this.$el.removeClass('dl-off-canvas-open');
			this.$el.addClass('dl-off-canvas-toggle');
			this.$trigger.removeClass('dl-active' );
            $body.removeClass('dlmenu-off-scroll');
			
			if( this.supportTransitions ) {
				this.$menu.on( this.transEndEventName, onTransitionEndFn );
			}
			else {
				onTransitionEndFn.call();
			}

			this.open = false;
		},
		openMenu : function() {
			if( !this.open ) {
				this._openMenu();
			}
		},
		_openMenu : function() {
			var self = this;
			// clicking somewhere else makes the menu close
			// $body.off( 'click' ).on( 'click.dlmenu', function() {
			// 	self._closeMenu() ;
			// } );
            self.$el.on('click', '.close-button', function(event) {
                    self._closeMenu();
            } );
            self.$el.on('click', function(event) {
				if ($( event.target).hasClass('dl-off-canvas')) {
                    self._closeMenu();
                }
			} );
			this.$el.addClass( 'dl-off-canvas-toggle dl-off-canvas-open' ).on( this.transEndEventName, function() {
				$( this ).removeClass('dl-off-canvas-toggle');
			} );
			this.$trigger.addClass('dl-active');
			this.open = true;
            $body.addClass('dlmenu-off-scroll');
		},
		// resets the menu to its original state (first level of options)
		_resetMenu : function() {
			this.$menu.removeClass( 'dl-subview' );
			this.$menuitems.removeClass( 'dl-subview dl-subviewopen' );
		}
	};

	var logError = function( message ) {
		if ( window.console ) {
			window.console.error( message );
		}
	};

	$.fn.dlmenu = function( options ) {
		if ( typeof options === 'string' ) {
			var args = Array.prototype.slice.call( arguments, 1 );
			this.each(function() {
				var instance = $.data( this, 'dlmenu' );
				if ( !instance ) {
					logError( "cannot call methods on dlmenu prior to initialization; " +
					"attempted to call method '" + options + "'" );
					return;
				}
				if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
					logError( "no such method '" + options + "' for dlmenu instance" );
					return;
				}
				instance[ options ].apply( instance, args );
			});
		} 
		else {
			this.each(function() {	
				var instance = $.data( this, 'dlmenu' );
				if ( instance ) {
					instance._init();
				}
				else {
					instance = $.data( this, 'dlmenu', new $.DLMenu( options, this ) );
				}
			});
		}
		return this;
	};

} )( jQuery, window );