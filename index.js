/*
 @license Track-with-tags @track-with-tags_version
 (c) 2016 Podbox. https://www.podbox.com
 License: MIT
 */
(function(angular, undefined) {
    'use strict';

    if (!angular) {
		console.error('AngularJS is not loaded. Include it in the html page or use the AngularJS-ready package of track-with-tags.');
	}
	else {
		angular.module('TrackWithTags', [])
			.factory('trackService', ['$window', function($window) {
				// defines the trackService methods
				var trackService = {
					page: page,
					event: event,
					userVariable: userVariable,
					pageVariable: pageVariable
				};

				/** returns the Google Analytics tracker or initializes it */
				function getGa() {
					// initializes the ga global variable if it does not exist
                    $window.ga = $window.ga || function() {
                        ($window.ga.q = $window.ga.q || []).push(arguments);
                    };

					return $window.ga;
				}

				/** tracks a page view (see https://developers.google.com/analytics/devguides/collection/gajs/asyncMigrationExamples#virtual-pageviews) */
				function page(pageName) {
					getGa().push(['_trackPageview', pageName]);
				}

				/** tracks an event */
				function event(category, action, label, value, nonInteraction) {
					getGa().push(['_trackEvent', category, action, label, value, nonInteraction]);
				}

				/** tracks a custom variable */
				function userVariable(index, name, value) {
					getGa().push(['_setCustomVar', index, name, value, 1]);
				}

				/** tracks a page variable */
				function pageVariable(index, name, value) {
					getGa().push(['_setCustomVar', index, name, value, 3]);
				}

				return trackService;
			}])
			// helper regexp and factory for the tracking directives
			.value('gaHelper', {
				/* Retrieves the tracking method and its arguments
				 * The text which will be executed by the regexp could be: 'event(category, action, label)' which
				 * would call the trackService.event() tracking method with arguments between the parentheses
				 */
				componentsRE: /(\w+)\(([^)]+).*\)/,

				/**
				 * Builds the tracking callback expected from the expression carried in the expression
				 * stored in the attribute corresponding to the directive snake-cased name
				 *
				 * @param re injects the regexp which decomposes the attribute into the tracking method
				 * @param trackService injects the tracking service
				 * @param attrs the attributes of the directive scope
				 * @param directiveSCName the attribute containing the tracking expression (directive snake-cased name)
				 *
				 * @return the tracking function or null
				 */
				trackerFactory: function(re, trackService, attrs, directiveSCName) {
			        var trackingElements = re.exec(attrs[directiveSCName]);

					if (angular.isArray(trackingElements) && 3 === trackingElements.length
							&& 'function' === typeof trackService[trackingElements[1]]
							&& 'string' == typeof trackingElements[2]) {

						var trackMethod = trackService[trackingElements[1]],
							trackArguments = trackingElements[2].split(',')
								.map(function(argument) {
									return argument.trim();
								})
								// replaces empty and 'undefined' strings by the undefined keyword
								.map(function(argument) {
									return (0 === argument.length || 'undefined' === argument) ? undefined : argument;
								});

							// manages the non-interaction flag for event tracking
							if ('event' === trackingElements[1] && trackArguments.length > 4) {
								trackArguments[4] = ('1' === trackArguments[4] || 'true' === trackArguments[4]);
							}

						// creates the tracking function, to be bind and unbind from the element
						return function() {
							trackMethod.apply(trackMethod, trackArguments);
						};
					}
					else {
					    return null;
					}
			    },

				/**
				 * Builds the directive and its link function (like ga-click, ga-focus)
				 *
				 * @param directiveSCName the snake-cased attribute name which holds the tracking characteristics
				 * @param eventName the event name to which the tracking function will be bound on: 'click', 'focus' (the element must be focusable)
				 * @param trackService injected to actually perform the tracking
				 *
				 * @return the expected link function
				 */
				directiveFactory: function(directiveSCName, eventName, trackService) {
					// flags the components regexp
					var re = this.componentsRE,
						trackerFactory = this.trackerFactory;

				    return {
						restrict: 'A',
						// no isolated scope so that several tracking directives can be used on the same element
						scope: false,
						// produces the link function with an iife which properly handles undefined values
						link: function(scope, element, attrs) {
							// builds the tracking function from the arguments (can be null)
							var tracker = trackerFactory(re, trackService, attrs, directiveSCName);
							if (null !== tracker) {
								// binds the tracker on the given event name
								element.bind(eventName, tracker);

								// unbinds the tracker when the directive is removed
								scope.$on('$destroy', function() {
									element.unbind(eventName, tracker);
								});
							}
					    }
					}
				}
			})
			.directive('gaClick', ['trackService', 'gaHelper', function(trackService, gaHelper) {
				return gaHelper.directiveFactory('gaClick', 'click', trackService);
			}])
			.directive('gaFocus', ['trackService', 'gaHelper', function(trackService, gaHelper) {
				return gaHelper.directiveFactory('gaFocus', 'focus', trackService);
			}])
			.directive('gaSubmit', ['$window', '$timeout', 'trackService', 'gaHelper', function($window, $timeout, trackService, gaHelper) {
				return {
					restrict: 'A',
					// no isolated scope so that several tracking directives can be used on the same element
					scope: false,
					link: function(scope, element, attrs) {
						// the element must be a form
						if (element.length && element.length > 0 && 'form' === element[0].tagName.toLowerCase()) {
							// binds the tracker if it is not null
							var tracker = gaHelper.trackerFactory(gaHelper.componentsRE, trackService, attrs, 'gaSubmit');
							if (null !== tracker) {
								// pauses the submission while executing the tracker
								var submissionCallback = function(event) {
									tracker();
									event.preventDefault();

									// waits for 250ms before submitting the form (pray for the tracking to be done)
									$timeout(function() {
										element[0].submit();
									}, 250);
								};

								// binds the tracker, unbinds it when the directive is removed
								element.bind('submit', submissionCallback);

								scope.$on('$destroy', function() {
									element.unbind('submit', submissionCallback);
								});
							}
						}
					}
				};
			}])
			;
	}
}(window && window.angular ? window.angular : null));
