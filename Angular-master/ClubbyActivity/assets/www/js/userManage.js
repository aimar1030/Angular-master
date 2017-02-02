
var drinkUrl = server + "api/getdrinkitems";
var phone_number = null;
var food_info = null;
var drink_info = null;
var cart_new_count = 0;
var order_id = 0;
var orders_hist = [];
var order_type = "Pending";

app.controller('loginCtrl', function ($scope, $http) {
//oid INTEGER, telnum TEXT, ojstr TEXT, status TEXT, dat TEXT, tim TEXT, ocode TEXT, tip INTEGER
    $scope.doPendingOrders = function () {
        var get_orders = "SELECT * FROM order_tb WHERE status LIKE 'Pending'";
        gDatabase.transaction(function(tx) {        
            tx.executeSql(get_orders, [], 
                function(tx, result){
                    print_log("all orders seleced");
                    orders_hist = [];
                    var dataset = result.rows;
                    var i;
                    for (i = 0; i < dataset.length; i ++) {
                        var row = dataset.item(i);
                        var obj = new Object();
                        obj.oid = row.oid;
                        obj.telnum = row.telnum;
                        obj.detail = JSON.parse(row.ojstr);
                        obj.status = "PENDING";
                        obj.dat = row.dat;
                        obj.tim = row.tim;
                        obj.ocode = row.ocode;
                        obj.tip = row.tip;
                        obj.cart_num = row.cart_num;
                        print_log("order: " + JSON.stringify(obj));                        
                        orders_hist.splice(orders_hist.length, 0, obj);
                    }
                    order_type = "Pending";
                    signin.pushPage('receipts.html', {animation:'slide'});
                }, 
                function(tx, error) {
                    alert("database error");                        
                });
        }); 
    }
    $scope.doCompletedOrders = function () {
        var get_orders = "SELECT * FROM order_tb WHERE status LIKE 'Completed'";
        gDatabase.transaction(function(tx) {        
            tx.executeSql(get_orders, [], 
                function(tx, result){
                    print_log("all orders seleced");
                    orders_hist = [];
                    var dataset = result.rows;
                    var i;
                    for (i = 0; i < dataset.length; i ++) {
                        var row = dataset.item(i);
                        var obj = new Object();
                        obj.oid = row.oid;
                        obj.telnum = row.telnum;
                        obj.detail = JSON.parse(row.ojstr);
                        obj.status = "COMPLETED";
                        obj.dat = row.dat;
                        obj.tim = row.tim;
                        obj.ocode = row.ocode;
                        obj.tip = row.tip;
                        obj.cart_num = row.cart_num;
                        print_log("order: " + JSON.stringify(obj));                        
                        orders_hist.splice(orders_hist.length, 0, obj);
                    }
                    order_type = "Completed";
                    signin.pushPage('receipts.html', {animation:'slide'});
                }, 
                function(tx, error) {
                    alert("database error");                        
                });
        }); 
    }
    $scope.doStartOrder = function(phno) {
        //var INSERT_ORDER = "INSERT INTO order_tb(oid, telnum, ojstr, status) VALUES (?,?,?,?)";
        gDatabase.transaction(function(tx) {        
            tx.executeSql(INSERT_ORDER, [order_id, phno, "[]", "Pending", "", "", "----", 0, 0], 
                function(tx, result){
                    print_log("orders inserted");
                    $http.jsonp(drinkUrl + '?callback=JSON_CALLBACK').success(function (response) {
                        loading_madal.hide();
                        phone_number = phno;
                        cart_new_count = 0;
                        cart_info = [];
                        print_log('drinks:' + JSON.stringify(response)); 
                        drink_info = response;
                        menu.setMainPage('food.html', {closeMenu: true});//home.pushPage("location.html", options);
                    }).error(function (data, status, headers, config) {
                        alert(data + status + headers + config);
                        loading_madal.hide();

                    });                    
                }, 
                function(tx, error) {
                    loading_madal.hide();
                    alert("database error");                        
                });
        });
    }
    $scope.doLogin = function (phno) {

        if (phno) {

            loading_madal.show();
            var get_orders = "SELECT * FROM order_tb";
            gDatabase.transaction(function(tx) {        
                tx.executeSql(get_orders, [], 
                    function(tx, result){
                        var dataset = result.rows;
                        print_log("orders seleced" + dataset.length);
                        order_id = dataset.length + 1;
                        $scope.doStartOrder(phno);
                    }, 
                    function(tx, error) {
                        loading_madal.hide();
                        alert("database error");                        
                    });
            }); 
        }
        else {
            alert("Por favor complete con el numero de telefono");
        }
    };
});

 app.directive('onlyDigits', function () {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function (scope, element, attr, ctrl) {
        function inputValue(val) {
          if (val) {
            var digits = val.replace(/[^0-9.]/g, '');

            if (digits !== val) {
              ctrl.$setViewValue(digits);
              ctrl.$render();
            }
            return digits;
          }
          return "";
        }            
        ctrl.$parsers.push(inputValue);
      }
    };
 });