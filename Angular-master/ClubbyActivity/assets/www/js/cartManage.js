var submit_payment = {};
app.controller('cartCtrl', function ($http, $scope) {

    $scope.drinks = [];
    $scope.foods = [];
    $scope.restaurant_id = 0;
    $scope.cart_index = [];
    $scope.cart_array = [];
    $scope.totalPrice = 0;
    $scope.subTotal = 0;
    $scope.tips = 0;
    $scope.tip = 0;
    $scope.promoto = 1000;
    $scope.phone_number = null;

    $scope.start = function () {      

      $scope.totalPrice = 0;
      $scope.subTotal = 0;
      $scope.tips = 0;
      $scope.promoto = 0;
//      cart_new_count = 0;
      
      $scope.restaurant_id = 0;//rest_id;
      $scope.foods = [];//food_info.foodlist;
      $scope.drinks = drink_info.drinklist;
      $scope.phone_number = phone_number;
      //$scope.getCartList($scope.restaurant_id);
      print_log("phone number: " + $scope.phone_number);
      //var page = home.getCurrentPage();
      
      $scope.onGetCarts(null);//page.options.result);
    }
    $scope.findFood = function (fid) {
      var i;
      var f = null;
      for (i = 0; i < $scope.foods.length; i ++) {
        if ($scope.foods[i].foodid == fid) {
          f = $scope.foods[i];
          return f;
        }
      }
      return f;
    }
    $scope.findDrink = function (fid) {
      var i;
      var f = null;
      for (i = 0; i < $scope.drinks.length; i ++) {
        if ($scope.drinks[i].drinkid == fid) {
          f = $scope.drinks[i];
          return f;
        }
      }
      return f;
    }
    $scope.onGetCarts = function (results) {

        var dataset = cart_info;//results.rows;
        print_log("cart exist " + dataset.length);
        print_log("carts from db - " + JSON.stringify(dataset));

        var i;
        if (dataset.length <= 0) {
          //alert("There are no items in the cart. \nPlease add items to your order.");
          showToastMsg("There are no items in the cart. \nPlease add items to your order.");
          home.popPage();
          return;
        }
        for (i = 0; i < dataset.length; i ++) {
            //print_log(dataset.item(0));
            var row = dataset[i];//dataset.item(i); 
            
            var obj = new Object();      
            obj.cid = row.cid;
            obj.rid = row.rid;
            obj.fid = row.fid;
            obj.type = row.type;
            obj.quantity = row.quantity;
            obj.extra = row.extra;
            obj.garnish = row.garnish;
            obj.dupcount = row.dupcount;
            obj.foodname = "";//$scope.foods[i].foodname;
            obj.imgurl = "";//$scope.foods[i].imgurl;                

            obj.plusname = "";//temp.plusname;
            obj.price = 0;//temp.price;
            obj.totalprice = 0;//temp.price*obj.dupcount;
            var xxx = null;
            print_log(JSON.stringify(row));

            if (obj.type == 0) {

              xxx = $scope.findFood(row.fid);
              print_log("xxx-food-finding");
              if (xxx != null) {
                print_log("xxx-food-found");
                obj.foodname = xxx.foodname;
                obj.imgurl = xxx.imgurl;

                var temp1 = $scope.calcFoodPrice(obj.quantity, obj.extra, obj.garnish, xxx, obj.dupcount);

                obj.plusname = temp1.plusname;
                obj.price = temp1.price;
                obj.totalprice = temp1.price*obj.dupcount;
              }
            } else if (obj.type == 1) {
              xxx = $scope.findDrink(row.fid);
              if (xxx != null) {
                obj.foodname = xxx.drinkname;
                obj.imgurl = xxx.imgurl;

                var temp2 = $scope.calcDrinkPrice(obj.quantity, obj.extra, obj.garnish, xxx, obj.dupcount);

                obj.plusname = temp2.plusname;
                obj.price = temp2.price;
                obj.totalprice = temp2.price*obj.dupcount;                    
              }
            }
            $scope.cart_index[i] = obj;
            //alert("-----------" + JSON.stringify($scope.cart_index));
            //$scope.calcTotal();
        }
        $scope.calcTotal();
    }
    
    $scope.calcFoodPrice = function(q, e, g, food) {
      var price = food.foodprice.substr(food.foodprice.lastIndexOf('$') + 1);
      var totalPrice = price*1;
      var plusName = "";
      if (food.foodquantity.length>0) {
        totalPrice += food.foodquantity[q-1].price*1;
        if (plusName=="") {
          plusName = food.foodquantity[q-1].name;
        } else {          
          plusName += " + " + food.foodquantity[q-1].name;
        }
      }
      if (food.foodextra.length>0) {
        print_log("e=" + e + " length=" + food.foodextra.length);
        totalPrice += food.foodextra[e-1].price*1;
        if (plusName=="") {
          plusName = food.foodextra[e-1].name;
        } else {          
          plusName += " + " + food.foodextra[e-1].name;
        }
      }
      if (food.foodgarnish.length>0) {
        totalPrice += food.foodgarnish[g-1].price*1;
        if (plusName=="") {
          plusName = food.foodgarnish[g-1].name;
        } else {          
          plusName += " + " + food.foodgarnish[g-1].name;
        }
      }
      totalPrice *= 1;//dupcount;
      return {price:totalPrice, plusname:plusName};
    }
    $scope.calcDrinkPrice = function(q, e, g, drink) {
      var price = drink.drinkprice.substr(drink.drinkprice.lastIndexOf('$') + 1);
      var totalPrice = price*1;
      var plusName = "";
      if (drink.drinkquantity.length>0) {
        totalPrice += drink.drinkquantity[q-1].price*1;
        if (plusName=="") {
          plusName = drink.drinkquantity[q-1].name;
        } else {          
          plusName += " + " + drink.drinkquantity[q-1].name;
        }
      }
      if (drink.drinkextra.length>0) {
        totalPrice += drink.drinkextra[e-1].price*1;
        if (plusName=="") {
          plusName = drink.drinkextra[e-1].name;
        } else {          
          plusName += " + " + drink.drinkextra[e-1].name;
        }
      }
      if (drink.drinkgarnish.length>0) {
        totalPrice += drink.drinkgarnish[g-1].price*1;
        if (plusName=="") {
          plusName = drink.drinkgarnish[g-1].name;
        } else {          
          plusName += " + " + drink.drinkgarnish[g-1].name;
        }
      }
      totalPrice *= 1;//dupcount;
      return {price:totalPrice, plusname:plusName};
    }
    $scope.calcTotal = function () {
      var i;
      $scope.totalPrice = 0;
      $scope.subTotal = 0;
      $scope.tips = 0;
      $scope.tip = 0;
      $scope.promoto = 0;//1000;
      for (i = 0; i < $scope.cart_index.length; i ++) {
        $scope.subTotal += $scope.cart_index[i].totalprice;
      }
      $scope.tips = $scope.subTotal*0.1;
      $scope.totalPrice = $scope.subTotal + $scope.tips - $scope.promoto;

      var c1 = document.getElementById('check_use_tip');
      if (c1.checked == false) {
        $scope.tip = 0;
        $scope.totalPrice -= $scope.tips;
      } else {
        $scope.tip = $scope.tips;
      }
    }
    $scope.updateCartPrice = function(index) {
      $scope.cart_index[index].totalprice = $scope.cart_index[index].price * $scope.cart_index[index].dupcount;
    }
    $scope.onClear = function(index) {
      //alert("clear...");
      var cid = $scope.cart_index[index].cid;
      var rid = $scope.cart_index[index].rid;
      var fid = $scope.cart_index[index].fid;
      cart_new_count --;
      $scope.cart_index.splice(index, 1);
      var i;
      for (i = 0 ;i < cart_info.length; i ++) {
        if (cart_info[i].cid == cid) {
          cart_info.splice(i, 1);
          break;
        }
      }
     var update_order = "UPDATE order_tb SET ojstr='" + JSON.stringify(cart_info) + "', cart_num=" + cart_new_count + " WHERE oid=" + order_id;
      print_log(update_order);

      gDatabase.transaction(function(tx) {
        tx.executeSql(update_order, [], 
          function(tx, result) {
            print_log("order updated");
            print_log("deleted from cart_tb");
            if ($scope.cart_index.length<=0) {
              showToastMsg("There are no items in the cart. \nPlease go back to add items to your order.");
              home.popPage();
              menu.setMainPage('food.html', {closeMenu: true});
            }
          }, onExecuteSqlError);
      });
      // var query_str = "DELETE FROM cart_tb WHERE cid=" + cid + " AND rid=" + rid + " AND fid=" + fid;
      // print_log("deleting cart - " + query_str);
      // gDatabase.transaction(function(tx){
      //   tx.executeSql(query_str, [], function(tx,results){
          
      //   }, onExecuteSqlError);
      // });
    }
    $scope.onDonePayment = function () {
      submit_payment.telnum = phone_number;
      submit_payment.orderid = order_id;
      var i;
      var odet = [];
      for (i = 0; i < cart_info.length; i ++) {
        var row = cart_info[i];
        var obj = new Object();
        obj.id = row.fid;
        obj.type = row.type;
        obj.quantity = row.quantity;
        obj.extra = row.extra;
        obj.garnish = row.garnish;
        obj.dupcount = row.dupcount;
        obj.eachprice = row.price;
        obj.totalprice = row.dupcount * row.price;
        odet.splice(odet.length, 0, obj);
      }
      submit_payment.ordersdetail = odet;
      submit_payment.tip = $scope.tip;
      submit_payment.total = $scope.totalPrice;
      submit_payment.subtotal = $scope.subTotal;
      print_log("submit json: " + JSON.stringify(submit_payment));
      home.pushPage('completeorder.html', {animation:'slide'});
    }
    $scope.onCheckTips = function () {
       $scope.calcTotal();
    }
    $scope.incdecCounter = function (index, type) {
        var $button = $('.' + type + '.auto_button');
        var newVal = 1;
        var oldValue = $scope.cart_index[index].dupcount;
        if ($button.attr('icon') == "ion-arrow-right-b") {
              newVal = $scope.cart_index[index].dupcount + 1;
        } else {
            if (oldValue > 1) {
                newVal = $scope.cart_index[index].dupcount - 1;
            } else {
                newVal = 1;
            }
        }
        $scope.cart_index[index].dupcount = newVal;
        var i;
        for (i = 0 ;i < cart_info.length; i ++) {
          if (cart_info[i].cid == $scope.cart_index[index].cid) {
            cart_info[i].dupcount = newVal;
            break;
          }
        }
        $scope.updateCartPrice(index);
        $scope.calcTotal();
        var update_order = "UPDATE order_tb SET ojstr='" + JSON.stringify(cart_info) + "', cart_num=" + cart_new_count + " WHERE oid=" + order_id;
        print_log(update_order);

        gDatabase.transaction(function(tx) {
          tx.executeSql(update_order, [], 
            function(tx, result) {
              print_log("order updated");
              
            }, onExecuteSqlError);
        });
    }
});

var orderUrl = "http://nikita.clubby.cl/api/order";///?json={......}";
app.controller('payconfirmCtrl', function ($scope, $http) {

    $scope.phone_number = null;
    $scope.total = 0;
    $scope.payback = 0;

    $scope.start = function () {      

      $scope.payMethod = 0;
      $scope.phone_number = phone_number;
      $scope.total = submit_payment.total;
      $scope.payback = 0;
      //$scope.getCartList($scope.restaurant_id);
      print_log("phone number: " + $scope.phone_number);      
    }
    $scope.onChangeCashAmount = function() {
      //if ($scope.cash_amount < $scope.total)
      $scope.payback = $scope.cash_amount - $scope.total;
    }

    $scope.doPay = function () {
      if ($scope.payMethod == 0) {
        submit_payment.payment_type="cash";
        if ($scope.cash_amount) {
          submit_payment.payment_val=$scope.cash_amount;
          if ($scope.cash_amount < $scope.total) {
            alert('Please check the amount is lesser than the bill amount.');
            return;
          }
        } else {
          alert('Please enter the amount');
          return;
        }
      } else if ($scope.payMethod == 1) {
        submit_payment.payment_type="card";
        if ($scope.card_number) {
          submit_payment.payment_val=$scope.card_number;
        } else {
          alert('Please enter the transaction receipt number');
          return;
        }
      }
      var url = orderUrl + "?json=" + JSON.stringify(submit_payment) + "&callback=JSON_CALLBACK";
      print_log("submit payment:" + url);
      loading_madal.show();
      $http.jsonp(url).success(function (response) {
          
          //print
//          window.plugin.printer.isServiceAvailable(
//                    function (isAvailable) {
//                        alert(isAvailable ? 'Service is available' : 'Service NOT available');
//                    }
//          );
//  
//          window.plugin.printer.isServiceAvailable(
//              function (isAvailable, installedAppIds) {
//                  alert('The following print apps are installed on your device: ' + installedAppIds.join(', '));
//              }
//          );
          
          loading_madal.hide();
          print_log("submit response:" + JSON.stringify(response));
          var ocode = response.order_code;
          var tim = response.time;          
          var dsd = getFormatedDate(tim);
          print_log("date: " + dsd);
          var tst = getFormatedTime(tim);
          print_log("date: " + tst);

          //alert("data: " + dsd + " " + tst);
          //oid, telnum, ojstr, status, dat, tim, ocode, tip
          var update_order = "UPDATE order_tb SET status='Completed', dat='" + dsd + "', tim='" + tst + "', ocode='" + ocode + "', tip=" + submit_payment.tip + " WHERE oid=" + order_id;
          print_log(update_order);

          gDatabase.transaction(function(tx) {
            tx.executeSql(update_order, [], 
              function(tx, result) {
                print_log("order updated");

                menu.setMainPage('login.html', {closeMenu: true});//home.pushPage("location.html", options);
                
              }, onExecuteSqlError);
          });
          
      }).error(function (data, status, headers, config) {
        alert(data + status + headers + config);
          loading_madal.hide();

      }); 
    }
    $scope.onChangePayMethod = function(index) {
      //alert($scope.payMethod);

    }
});

var mon_str = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function getFormatedDate(d) {
  var currentTime = new Date(d*1000);
  var month = currentTime.getMonth();
  var day = currentTime.getUTCDate();
  var year = currentTime.getFullYear();
  var sday = day;
  var smonth = month;
  if (day < 10) {
    sday = "0"+day;
  }
  
  return (sday+" " +mon_str[month]);
}
//returns time in format 05:45 AM
function getFormatedTime(t) {
  var time = "";
  var currentTime = new Date(t*1000);
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();

  if (minutes < 10) {
  minutes = "0" + minutes;
  }
  var h = hours;

  var sec
  if (h < 12) {
    sec = "A.M"
  } else {
    sec = "P.M"
  }
  if (h > 12) {
    h = h-12;
  }

  if (h < 10) {
    h = '0' + h;
  }

  time += (h + ":" + minutes + " " + sec);
  
  return time;
}