angular.module('projek.announcement', [])

.controller('AnnouncementCtrl', function($scope, $state, $ionicLoading, $updates) {
    function fetch() {
      return $updates.findAll({
        page: {offset: $scope.updates.length}
      }, {
        include: ['project']
      }).then(function (items) {
        if (items.length === 0) {
          $scope.canFetch = false;
        }

        Array.prototype.push.apply($scope.updates, items);
      });
    }

    $scope.updates = [];
    $scope.canFetch = true;

    $scope.fetchMore = function () {
      fetch().finally(function () {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    }

    $scope.refresh = function() {
      $scope.updates = [];
      $scope.canFetch = true;
      fetch().finally(function() {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    fetch();
})
