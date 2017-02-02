var foodUrl = server + "api/getfooditems";
var drinkUrl = server + "api/getdrinkitems";
var rest_id = -1;
var food_info = null;
var drink_info = null;
var cart_new_count = 0;
app.controller('dishesCtrl', function ($http, $scope, $compile, $sce) {

    $scope.restaurant_id = 0;

    $scope.start = function () {
      rest_id = '1';
      print_log("rest id: " + $scope.restaurant_id);
      $scope.getNewCartNumber();
    }
    
    $scope.getNewCartNumber = function () {
      var query = "SELECT * FROM new_cart_tb WHERE rid="+$scope.restaurant_id;
      gDatabase.transaction(function(tx){
        tx.executeSql(query,[],function(ctx, results){
          var dataset = results.rows;
          if (dataset.length > 0) {
            cart_new_count = dataset.item(0).cn;
          } else {
            cart_new_count = 0;
          }

        }, onExecuteSqlError);
      });
    }
});
