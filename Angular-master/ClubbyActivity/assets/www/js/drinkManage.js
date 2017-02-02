
var add_drink = {};
var cart_info = [];
app.controller('drinkCtrl', function ($scope, $http) {

    $scope.category_index = 0;
    $scope.category_array = ["All Categories"];
    $scope.drinks = [];
    $scope.drink_array = [];
    $scope.drink_list = [];
    $scope.islist = false;
    $scope.restaurant_id = 0;
    $scope.phone_number = null;
    $scope.cart_num = 0;
    
    $scope.start = function () {
      
      $scope.category_array = ["All Categories"];//, "Pizza", "Burger"];
      $scope.islist = false;
      $scope.drinkCategory = $scope.category_array[0];
      $scope.category_index = 0;
      $scope.cart_num = cart_new_count;
      $scope.phone_number = phone_number;
      print_log("phone number: " + $scope.phone_number);
      
      // $http.jsonp(drinkUrl + '?callback=JSON_CALLBACK').success(function (drink_info) {
        if (drink_info != null) {    
            print_log('drinks:' + JSON.stringify(drink_info));
            var i, j, k, ca_i;
            if (drink_info.categories && drink_info.drinklist){
                $scope.drinks = drink_info.drinklist;
                for (i = 0; i < drink_info.categories.length; i ++){
                  $scope.category_array.splice(i+1, 0, drink_info.categories[i]);
                  $scope.drink_list.splice(i, 0, []);
                  $scope.drink_array.splice(i, 0, []);
                }
                // alert($scope.drink_list.length);
                for (i = 0; i < drink_info.drinklist.length; i ++) {
                  ca_i = drink_info.drinklist[i].drinkcategory-1;
                  $scope.drink_list[ca_i].splice($scope.drink_list[ca_i].length, 0, drink_info.drinklist[i]);
                  $scope.drink_list[ca_i][$scope.drink_list[ca_i].length-1].addcount = 0;
                }
                for (i = 0; i < cart_info.length; i ++) {
                  for (j = 0; j < $scope.drink_list.length; j ++) {
                    for (k = 0; k < $scope.drink_list[j].length; k ++) {
                      if (cart_info[i].fid == $scope.drink_list[j][k].drinkid) {
                        $scope.drink_list[j][k].addcount += cart_info[i].dupcount;
                      }
                    }
                  }
                }
                for (i = 0; i < $scope.drink_list.length; i ++) {
                  for (j = 0; j < $scope.drink_list[i].length; j ++) {
                    k = Math.floor(j/3);
                    
                    if (j%3 == 0) {
                      $scope.drink_array[i].splice($scope.drink_array[i].length, 0, []);
                    }                 
                    $scope.drink_array[i][k].splice(j%3, 0, $scope.drink_list[i][j]);
                  }
                }
            }
        } else {
          alert("drink information did not be loaded yet.");
        }   

      
      // }).error(function (data, status, headers, config) {

      // });
    }
    $scope.canShow = function(index) {
      if ((index+1)==$scope.category_index || $scope.category_index==0) {
        return true;
      }
      return false;
    }
    $scope.onChangeCategory = function () {
      var index = $("#drink_category_select option:selected").val();
      $scope.category_index = index;
      // alert("category changed - " + index + " - " + $scope.drinkCategory);
    }    
    $scope.showByList = function () {
      $scope.islist = !($scope.islist);
      //alert("Please wait...");
    }
    $scope.showDlg = function(dlg, item) {
      //alert(JSON.stringify(items));
      var bOK = ( (item.drinkquantity && item.drinkquantity.length > 0) || (item.drinkextra && item.drinkextra.length > 0) || (item.drinkgarnish && item.drinkgarnish.length > 0) );
      if (!bOK) {
        
        var pric = item.drinkprice.substr(item.drinkprice.lastIndexOf('$') + 1); 
        
        var cart_item = new Object();
        cart_item.cid = cart_info.length;
        cart_item.rid = 0;
        cart_item.fid = item.drinkid*1;
        cart_item.name = item.drinkname;
        cart_item.type = 1;
        cart_item.quantity = 0;
        cart_item.extra = 0;
        cart_item.garnish = 0;
        cart_item.price = pric*1;
        cart_item.dupcount = 1;
        var i;
        var bAdded = false;

        for (i = 0; i < cart_info.length; i ++) {
          if (cart_info[i].fid==cart_item.fid && cart_info[i].quantity == cart_item.quantity && cart_info[i].extra==cart_item.extra && cart_info[i].garnish==cart_item.garnish) {
            cart_info[i].dupcount += cart_item.dupcount;
            bAdded = true;
            break;
          }
        }
        if (bAdded == false) {
          cart_info.splice(cart_info.length,0,cart_item);
          cart_new_count ++;
          $scope.cart_num = cart_new_count;
        }

        var update_order = "UPDATE order_tb SET ojstr='" + JSON.stringify(cart_info) + "', cart_num=" + cart_new_count + " WHERE oid=" + order_id;
        print_log(update_order);

        gDatabase.transaction(function(tx) {
          tx.executeSql(update_order, [], 
            function(tx, result) {
              print_log("order updated");
              menu.setMainPage('food.html', {closeMenu: true});
            }, onExecuteSqlError);
        });
      } else {
        add_drink = item;
        ons.createDialog(dlg).then(function (dialog) {
              dialog.show();
              dialog.on("posthide", function(e) {
                // e.dialog is a DialogView object
                $scope.cart_num = cart_new_count;
                menu.setMainPage('food.html', {closeMenu: true});
              });
          });
      }
    }
    $scope.markFavorite = function(items) {
      //alert("Mark " + items + "as favorite");
      print_log("Mark " + JSON.stringify(items) + " as favorite");
      var query = "SELECT * FROM favor_tb WHERE rid=" + $scope.restaurant_id + " AND type=1 AND fid=" + items.drinkid;
      gDatabase.transaction(function(tx){
        tx.executeSql(query, [], function(tx, result) {
          var dataset = result.rows;
          print_log("favor exist " + dataset.length);
          if (dataset.length <= 0) {
            gDatabase.transaction(function(ctx) {
              ctx.executeSql(INSERT_FAVOR, [$scope.restaurant_id, items.drinkid, 1], 
                function(tx, results){
                  print_log("favor inserted");
                  showToastMsg("It has been added to my favorites.");
                }, onExecuteSqlError);
            });
            var xitem = new Object();
            xitem.rid = $scope.restaurant_id;
            xitem.fid = items.drinkid;
            xitem.type = 1;
            favor_info.splice(favor_info.length, 0, xitem);
          } else {
            showToastMsg("It has already been added to my favorites.");
          }
        }, onExecuteSqlError);
      });
    }
    $scope.onOpenCart = function () {
    
      // var get_carts = "SELECT * FROM cart_tb WHERE rid=" + $scope.restaurant_id;
      // print_log(get_carts);
      //cart_new_count = 0;
      //$scope.cart_num = 0;
      // saveNewCartNumber($scope.restaurant_id, cart_new_count);

      // gDatabase.transaction(function(tx) {
      //   tx.executeSql(get_carts, [], function(tx, results) {
      //     var dataset = results.rows;
          if (cart_info.length<=0) {//dataset.length <= 0) {
            print_log("no cart exist " + cart_info.length);
            //alert("There are no items in the cart. \nPlease add items to your order.");
            showToastMsg("There are no items in the cart. \nPlease add items to your order.");
            return;
          }
          home.pushPage('order.html', {animation:'slide'});//, result:results});
      //   }, onExecuteSqlError);
      // });
    }
});
app.controller('drinkaddCtrl', function ($http, $scope, $compile, $sce) {

    $scope.drinkid = 0;
    $scope.drinkcategory = 1;
    $scope.drinkname = "sssss";
    $scope.drinkprice = "";
    $scope.imgurl = "";
    $scope.drinkquantity = [];
    $scope.drinkextra = [];
    $scope.drinkgarnish = [];
    $scope.totalPrice = 0;
    $scope.subPrice = 0;
    $scope.plusName = "";

    $scope.quantityIndex = 0;
    $scope.extraIndex = 0;
    $scope.garnishIndex = 0;
    $scope.dupNum = 1;
    $scope.restaurant_id = -1;

    $scope.price = 0;
    // true is to show ALL locations, false to show ONLY closests locations
    $scope.start = function () {
      $scope.drinkid = add_drink.drinkid;
      $scope.drinkcategory = add_drink.drinkcategory;
      $scope.drinkname = add_drink.drinkname;
      $scope.drinkprice = add_drink.drinkprice;
      $scope.imgurl = add_drink.imgurl;
      $scope.drinkquantity = add_drink.drinkquantity;
      $scope.drinkextra = add_drink.drinkextra;
      $scope.drinkgarnish = add_drink.drinkgarnish;
      //$scope.restaurant_id = rest_id;
      var pric = add_drink.drinkprice.substr(add_drink.drinkprice.lastIndexOf('$') + 1);      
    
      $scope.quantityIndex = 0;
      $scope.extraIndex = 0;
      $scope.garnishIndex = 0;

      $scope.drinkQuantity = 0;
      $scope.drinkExtra = 0;
      $scope.drinkGarnish = 0;

      $scope.price = pric;
      $scope.dupNum = 1;

      $scope.updatePrice();

    }
    $scope.updatePrice = function() {
      $scope.totalPrice = $scope.price*1;
      $scope.plusName = "";
      if ($scope.drinkquantity.length>0) {
        $scope.totalPrice += $scope.drinkquantity[$scope.quantityIndex].price*1;
        if ($scope.plusName=="") {
          $scope.plusName = $scope.drinkquantity[$scope.quantityIndex].name;
        } else {          
          $scope.plusName += " + " + $scope.drinkquantity[$scope.quantityIndex].name;
        }
      }
      if ($scope.drinkextra.length>0) {
        $scope.totalPrice += $scope.drinkextra[$scope.extraIndex].price*1;
        if ($scope.plusName=="") {
          $scope.plusName = $scope.drinkextra[$scope.extraIndex].name;
        } else {          
          $scope.plusName += " + " + $scope.drinkextra[$scope.extraIndex].name;
        }
      }
      if ($scope.drinkgarnish.length>0) {
        $scope.totalPrice += $scope.drinkgarnish[$scope.garnishIndex].price*1;
        if ($scope.plusName=="") {
          $scope.plusName = $scope.drinkgarnish[$scope.garnishIndex].name;
        } else {          
          $scope.plusName += " + " + $scope.drinkgarnish[$scope.garnishIndex].name;
        }
      }
      $scope.subPrice = $scope.totalPrice;
      $scope.totalPrice *= $scope.dupNum;
    }
    $scope.incdecCounter = function (type) {
        var $button = $('.' + type + '.auto_button');
        var oldValue = $scope.dupNum;//$('.inc_input').val();
        if ($button.attr('icon') == "ion-arrow-right-b") {
            var newVal = parseFloat(oldValue) + 1;
        } else {
            if (oldValue > 1) {
                newVal = parseFloat(oldValue) - 1;
            } else {
                newVal = 1;
            }
        }
        //$('.inc_input').val(newVal);
        $scope.dupNum = newVal;
        $scope.updatePrice();
    }
    $scope.onAddToOrder = function () {
        // var INSERT_CART = "INSERT INTO cart_tb(rid, fid, type, quantity, extra, garnish, dupcount) VALUES (?,?,?,?,?,?,?)";
      var qi = 0;
      var ei = 0;
      var gi = 0;
      if ($scope.drinkquantity.length > 0) {
        qi = $scope.quantityIndex*1+1;
      } else {
        qi = 0;
      }
      if ($scope.drinkextra.length > 0) {
        ei = $scope.extraIndex*1+1;
      } else {
        ei = 0;
      }
      if ($scope.drinkgarnish.length > 0) {
        gi = $scope.garnishIndex*1+1;
      } else {
        gi = 0;
      }
      // gDatabase.transaction(function(tx) {    
      //   tx.executeSql(INSERT_CART, [$scope.restaurant_id*1, $scope.drinkid*1, 1, qi, ei, gi, $scope.dupNum], 
      //     function(tx, result){
      //       print_log("cart inserted");
      // var INSERT_CART = "INSERT INTO cart_tb(rid, fid, type, quantity, extra, garnish, dupcount) VALUES (?,?,?,?,?,?,?)";
      
      var cart_item = new Object();
      cart_item.cid = cart_info.length;
      cart_item.rid = 0;
      cart_item.fid = $scope.drinkid*1;
      cart_item.name = $scope.drinkname;
      cart_item.type = 1;
      cart_item.quantity = qi;
      cart_item.extra = ei;
      cart_item.garnish = gi;
      cart_item.price = $scope.subPrice;
      cart_item.dupcount = $scope.dupNum;
      var bAdded = false;
      var i;
      for (i = 0; i < cart_info.length; i ++) {
        if (cart_info[i].fid==cart_item.fid && cart_info[i].quantity == cart_item.quantity && cart_info[i].extra==cart_item.extra && cart_info[i].garnish==cart_item.garnish) {
          cart_info[i].dupcount += cart_item.dupcount;
          bAdded = true;
          break;
        }
      }
      if (bAdded == false) {
        cart_info.splice(cart_info.length,0,cart_item);
        cart_new_count ++;
      }
      var update_order = "UPDATE order_tb SET ojstr='" + JSON.stringify(cart_info) + "', cart_num=" + cart_new_count + " WHERE oid=" + order_id;
      print_log(update_order);

      gDatabase.transaction(function(tx) {
        tx.executeSql(update_order, [], 
          function(tx, result) {
            print_log("order updated");
            drinkDialog.hide();
          }, onExecuteSqlError);
      });


            //saveNewCartNumber($scope.restaurant_id, cart_new_count);
            
      //       navigator.notification.vibrate(500);
      //     }, onExecuteSqlError); 
      // });
    }
    $scope.onChangeQuantity = function(index) {
      $scope.quantityIndex =  index;
      $scope.drinkQuantity = index;
      //$( "input:radio[name=navi-segment-a]:checked" ).val();
      $scope.updatePrice();
    }
    $scope.onChangeExtra = function(index) {
      $scope.extraIndex = index;//$( "input:radio[name=navi-segment-b]:checked" ).val();
      $scope.drinkExtra = index;
      $scope.updatePrice();
    }
    $scope.onChangeGarnish = function(index) {
      $scope.garnishIndex = index;//$( "input:radio[name=navi-segment-c]:checked" ).val();
      $scope.drinkGarnish = index;
      $scope.updatePrice();
    }
});