
app.controller('receiptsCtrl', function ($scope,$http) {
    $scope.groups = [];
    $scope.errmsg

    $scope.start = function() {
      if (orders_hist.length <= 0) {
        if (order_type == "Pending") {
          $scope.errmsg = "No hay pedidos pendientes.";
        } else {
          $scope.errmsg = "No hay pedidos completados.";
        }
        return;
      }
      var j;
      for (var i = 0; i < orders_hist.length; i++) {
          // $scope.groups[i] = {
          //     name: i,
          //     items: []
          // };
          $scope.groups[i] = orders_hist[i];

          
          var subtotal = 0;
          for (j = 0; j < orders_hist[i].detail.length; j++) {
              subtotal += orders_hist[i].detail[j].price * orders_hist[i].detail[j].dupcount;
          }
          var total = subtotal + orders_hist[i].tip;
          $scope.groups[i].subtotal = subtotal;
          $scope.groups[i].total = total;
          $scope.groups[i].index = i;
      }
      $scope.shownGroup = $scope.groups[orders_hist.length-1];
    }
    $scope.doPendingEdit = function(group) {
      phone_number = group.telnum;
      cart_new_count = group.cart_num;
      cart_info = group.detail;
      loading_madal.show();
      //drink_info = response;
      $http.jsonp(drinkUrl + '?callback=JSON_CALLBACK').success(function (response) {
          loading_madal.hide();
          phone_number = group.telnum;
          cart_new_count = group.cart_num;
          cart_info = group.detail;
          order_id = group.oid;
          print_log('drinks:' + JSON.stringify(response)); 
          drink_info = response;
          menu.setMainPage('food.html', {closeMenu: true});//home.pushPage("location.html", options);
      }).error(function (data, status, headers, config) {
          loading_madal.hide();

      });   
      //menu.setMainPage('food.html', {closeMenu: true});//home.pushPage("location.html", options);
    }
    $scope.doPendingDel = function(group) {
      ons.notification.confirm({
      message: 'Seguro que quieres eliminar esta orden?',
       buttonLabels: ['Cancelar', 'Borrar'],
        animation: 'default', // or 'none'
        primaryButtonIndex: 1,
        cancelable: true,
      callback: function(idx) {
          switch(idx) {
            case 0:              
              break;
            case 1:
              $scope.doDeleteReally(group);
              $scope.$apply();
              break;
          }
        }
      });
    }
    $scope.doDeleteReally = function(group) {
      var i;
      for (i = 0; i < $scope.groups.length; i ++) {
        if (group.oid == $scope.groups[i].oid) {
          $scope.groups.splice(i, 1);
          orders_hist.splice(i, 1);
          break;
        }
      }
      if ($scope.groups.length > 0) {
        $scope.shownGroup = $scope.groups[$scope.groups.length-1];
      }
      var delete_order = "DELETE FROM order_tb WHERE oid=" + group.oid;
      gDatabase.transaction(function(tx) {
        tx.executeSql(delete_order, [], 
            function(tx, result){
                print_log("an order deleced");
                if (orders_hist.length <= 0) {
                  signin.popPage();
                }
            }, 
            onExecuteSqlError);
        }); 

    }
    $scope.toggleGroup = function (group) {
      if ($scope.groups.length <= 0) return;
      if (group.index == $scope.groups.length-1) {
        $scope.shownGroup = group;
        return;
      }
      if ($scope.isGroupShown(group)) {
          $scope.shownGroup = null;
          $scope.shownGroup = $scope.groups[orders_hist.length-1];
      } else {
          $scope.shownGroup = group;
      }
    };
    
    $scope.isGroupShown = function (group) {
        return $scope.shownGroup === group;
    };

});
