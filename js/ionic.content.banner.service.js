/* global angular,ionic */
/**
 * @ngdoc service
 * @name $ionicContentBanner
 * @module ionic
 * @description The Content Banner is an animated banner that will show specific information to a user.
 */
(function (angular, ionic) {
  'use strict';

  angular.module('jett.ionic.content.banner')
    .factory('$ionicContentBanner', [
      '$document',
      '$rootScope',
      '$compile',
      '$timeout',
      '$ionicPlatform',
      '$log',
      function ($document, $rootScope, $compile, $timeout, $ionicPlatform, $log) {
        var cacheIndex = 0,
            bannerCache = {};

        function cacheBanner(scope){
          bannerCache[cacheIndex] = scope;
          scope.bannerCacheIndex = cacheIndex;
          cacheIndex ++;
        }

        /**
         * @ngdoc method
         * @name $ionicContentBanner#closeAll
         * @description
         * Closes all current banners
         */
        function closeAll(){
          $timeout(function(){
            angular.forEach(bannerCache, function(scope){
              scope.close();
            });
          });
        }

        /**
         * @ngdoc method
         * @name $ionicContentBanner#show
         * @description
         * Load and show a new content banner.
         */
        function contentBanner (opts) {
          var scope = $rootScope.$new(true);

          angular.extend(scope, {
            icon: 'ion-ios-close-empty',
            transition: 'vertical',
            interval: 7000,
            type: 'info',
            payload: null,
            $deregisterBackButton: angular.noop,
            onClose: angular.noop,
            onClick: angular.noop,
            closeOnStateChange: true,
            autoClose: null,
            position: null
          }, opts);

          // Compile the template
          var transitionClass = 'content-banner-transition-' + scope.transition;
          var classes = 'content-banner ' + scope.type;
          if ( scope.position === 'bottom' ){
            classes += ' content-banner-bottom';
            if ( scope.transition === 'vertical' ){
              transitionClass += '-bottom';
            }
          }
          classes += ' ' + transitionClass;
          var element = scope.element = $compile('<ion-content-banner class="' + classes + '"></ion-content-banner>')(scope);

          var stateChangeListenDone = scope.closeOnStateChange ?
            $rootScope.$on('$stateChangeSuccess', function() { scope.close(); }) :
            angular.noop;

          scope.$deregisterBackButton = $ionicPlatform.registerBackButtonAction(
            function() {
              $timeout(scope.close);
            }, 300
          );

          scope.close = function() {
            if (scope.removed) {
              return;
            }
            scope.removed = true;

            ionic.requestAnimationFrame(function () {
              element.removeClass('content-banner-in');

              $timeout(function () {
                scope.$destroy();
                element.remove();
                stateChangeListenDone = null;
              }, 400);
            });

            delete bannerCache[scope.bannerCacheIndex];

            scope.$deregisterBackButton();
            stateChangeListenDone();
          };

          scope.show = function() {
            if (scope.removed) {
              return;
            }

            $document[0].body.appendChild(element[0]);

            ionic.requestAnimationFrame(function () {
              $timeout(function () {
                element.addClass('content-banner-in');
                //automatically close if autoClose is configured
                if (scope.autoClose) {
                  $timeout(function () {
                    scope.close();
                  }, scope.autoClose, false);
                }
              }, 20);
            });
          };

          //set small timeout to let ionic set the active/cached view
          $timeout(function () {
            scope.show();
          }, 30, false);

          // Expose the scope on $ionContentBanner's return value for the sake of testing it.
          scope.close.$scope = scope;

          cacheBanner(scope);
          return scope.close;
        }

        var lastBannerFn;
        /**
         * @ngdoc method
         * @name $ionicContentBanner#quick
         * @param {String} text the text for the banner
         * @param {String} [options] Options to pass to show method. Also accepts a strint "type" instead
         * @description
         * A shortcut for creating a banner from just a string. This will also close an banners that were previously opened with this shortcut.
         * This could be improved to be configuratble through provider options, but for now it just have my preferred defaults baked in.
       */
        var quickBanner = function(text, options){
          if ( angular.isString(options) ){
            options = {type: options};
          }
          var opts = angular.extend({text: [text], position: 'bottom', autoClose: 3000, icon: '' }, options);
          if ( angular.isDefined(lastBannerFn) ){
            lastBannerFn();
          }
          lastBannerFn = contentBanner(opts);
          return lastBannerFn;
        };

        return {
          show: contentBanner,
          quick: quickBanner,
          closeAll: closeAll
        };
      }]);


})(angular, ionic);
