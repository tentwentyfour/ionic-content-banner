/* global angular */
(function (angular) {
  'use strict';

  angular.module('jett.ionic.content.banner')
    .directive('ionContentBanner', [
      '$interval',
      function ($interval) {
        return {
          restrict: 'E',
          scope: true,
          link: function ($scope, $element) {
            var stopInterval;

            $scope.currentIndex = 0;

            if ($scope.text.length > 1) {
              stopInterval = $interval(function () {
                $scope.currentIndex = ($scope.currentIndex < $scope.text.length - 1) ? $scope.currentIndex + 1 : 0;
              }, $scope.interval);
            }

            $scope.$on('$destroy', function() {
              $element.remove();
              if (stopInterval) {
                $interval.cancel(stopInterval);
              }
            });
          },
          template:
          '<a class="content-banner-text-wrapper" ng-click="onClick()">' +
            '<div ng-repeat="item in text track by $index" ng-class="{active: $index === currentIndex}" class="content-banner-text" ng-bind="item"></div>' +
          '</a>' +
          '<button class="content-banner-close button button-icon icon {{::icon}}" ng-click="close()"></button>'
        };
      }]);

})(angular);
