angular.module('projek.controllers', [])

.controller('MainCtrl', function($scope, $state, $auth) {
  $scope.logout = function() {
    $auth.logout();
    $state.go('intro');
  }
})
