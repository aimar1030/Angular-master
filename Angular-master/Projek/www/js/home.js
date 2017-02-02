angular.module('projek.home', [])

.controller('HomeCtrl', function($scope, $feed, $projects, $timeout, $ionicSlideBoxDelegate, pushService) {
    function fetch() {
      $scope.fetching = true;
      return $feed.findAll({
        page: {
          limit: 8,
          offset: $scope.items.length
        }
      }, {
        include: ['project']
      }).then(function (items) {
        if (items.length === 0) {
          $scope.canFetch = false;
        }

        Array.prototype.push.apply($scope.items, items.map(function (item) {
          return breakCyclesInBFS(item);
        }));
      });
    }

    $scope.hasFeatured = false;
    $scope.fetching = false;
    $scope.projects = [];
    $scope.items = [];
    $scope.canFetch = true;

    $scope.fetchMore = function () {
      fetch().finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $timeout(function () {
          $scope.fetching = false;
        });
      });
    }

    $scope.refresh = function() {
      $scope.items = [];
      $scope.canFetch = true;
      fetch().finally(function() {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    $scope.$on('$ionicView.enter', function () {
      if ($scope.hasFeatured) {
        $ionicSlideBoxDelegate.$getByHandle('hscroll').start();
      }
    });

    pushService.initOnce();

    $projects.findAll({
      filter: {featured: true}
    }).then(function(projects) {
      $scope.projects = _.shuffle(projects);
      $scope.hasFeatured = true;

      // bug with slide box specifically for 2 items
      if ($scope.projects.length === 2) {
        $scope.projects = $scope.projects.concat($scope.projects);
      }

      $timeout(function () {
        var slider = $ionicSlideBoxDelegate.$getByHandle('hscroll');
        slider.update();
      });
    });

    fetch();
});
