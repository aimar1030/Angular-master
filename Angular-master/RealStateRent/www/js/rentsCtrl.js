angular.module("whybuy.rentController",[])
.controller('rentsCtrl',function($scope,$state,$http,$rootScope,$ionicModal,$cordovaInAppBrowser,$cordovaBarcodeScanner,$cordovaProgress){
  function format_date(date){
    var day=date.getDate();
    var fullYear=date.getFullYear();
    var month=date.getMonth();
    month=month + 1;
    if (month < 10) {
      month="0"+month;
    }
    if (day < 10 ){
      day = "0"+ day;
    }
    var date_string=month+"/"+day+"/"+fullYear;
    return date_string;
  };
  $scope.loading_transactions=false;
  $scope.localize_date = function(date){
      var date_obj=new Date(date);
      return date_obj;
  };
  var today = new Date();
  $scope.today_string =  ("0" + (today.getMonth() + 1)).slice(-2)+"/"+("0" + today.getDate()).slice(-2)+"/"+today.getUTCFullYear();
  $scope.confirmation_create = function(transaction_id){
    var additional_info={
      TCTX_ID: transaction_id
    };
    $http({
        withCredentials: true,
        method: 'POST',
        url: 'https://www.whybuy.co.il/getTransactionQRCode',
        data: {additionalInfo: additional_info}
    })
    .success(function(data, status, headers, config) {
            $scope.qr_url=data.message.QRCodeImageLink;
            $ionicModal.fromTemplateUrl('templates/dislpayQR.html', {
               scope: $scope,
               animation: 'slide-in-up'
             }).then(function(modal) {
               $scope.modal = modal;
               $scope.modal.show();
             });
    })
    .error(function(data, status, headers, config) {
      $rootScope.showPopup("Error","Failed to create QR code please try again later or validate via numbers");
//        alert('Failed to create QR code please try again later or validate via numbers');
    });
  };
  $scope.disabled_button = new Array();
  $scope.message_update = function(transaction,payment_method){
      $scope.disabled_button[transaction]=true;
      console.log($scope.disabled_button);
      if (payment_method=="paypal"){
        var url="https://www.whybuy.co.il/paypalOperation";
      };
      if (payment_method=="payme"){
        var url="https://www.whybuy.co.il/paymeOperation";
      };
      var options = {
         location: 'yes',
         toolbar: 'yes'
       };
      var additional_info= {
        TCTX_ID:transaction,
        OPER : 'GENERATE_PAYMENT'
      };
      $http({
        withCredentials: true,
        method: 'POST',
        url: url,
        data: {additionalInfo: additional_info}
      })
      .success(function(data, status, headers, config) {
        console.log(data.message.URL);
        $cordovaInAppBrowser.open(data.message.URL, '_blank', options)
        //this part handle redirect url and closing of in app browser upon success
        $rootScope.$on('$cordovaInAppBrowser:loadstop',function(e,event){
          if (event.url.indexOf("https://www.whybuy.co.il") > -1 ){
              $rootScope.$$listeners['$cordovaInAppBrowser:loadstop']=[];
              $cordovaInAppBrowser.close();
              $rootScope.showPopup("Paument Validaation","Thank you! The system is currently validating your payment. We will update you shortly");
//              alert("Thank you! The system is currently validating your payment. We will update you shortly");
              handle_paypal_payment(event.url);
          };
        });
      })
      .error(function(data,status){
        $rootScope.showPopup("Error","failed to perform payment - please try again later");
//        alert("failed to perform payment - please try again later");
        $scope.disabled_button[transaction]=false;
      });
    };

 function handle_paypal_payment(event_url){
          if (event_url.indexOf('paymentId')!= -1){ // user succsefully returned from paypal
                  var url_parts=event_url.split("?");
                  var paypal_parts=url_parts[1].split("=");
                  var paymentID=paypal_parts[1].replace("&token","");
                  var PayerID=paypal_parts[3];
//                  alert(paymentID,PayerID);
                 var additional_info= {
                   PAYMENT_ID:paymentID,
                   PAYER_ID:PayerID
                 };
                 $http({
                   withCredentials: true,
                   method: 'POST',
                   url: 'https://www.whybuy.co.il/paypalOperation',
                   data: {additionalInfo: additional_info}
                 })
                  .success(function(data, status, headers, config) {
                    $scope.transactionsInit();
                 })
                 .error(function(data, status, headers, config) {
                   $rootScope.showPopup("Error","payment process failed please contact WhyBuy team");
      //             alert("payment process failed please contact WhyBuy team");
                   $scope.transactionsInit();
                 })
             };
 };

  $scope.cancelTransactionInit = function(){
    $scope.transaction={};
    $scope.transaction.id = $state.params.transactionId;
    $scope.transaction.itemID = $state.params.itemId;
  };

  $scope.no_transactions = true;
  $scope.transactionsInit = function(){
    $scope.side='renter'
    //$cordovaProgress.showSimple(true);
    $scope.loading_transactions=true;
      $http({
        withCredentials: true,
        method: 'POST',
        url: 'https://www.whybuy.co.il/getUserScenes'
      })
      .success(function(data, status, headers, config) {
        console.log(data);
        $scope.transactions=data.message;
        $scope.loading_transactions=false;
        if (JSON.stringify(data.message) != '{}'){
            $scope.no_transactions = false;
        };
        //$cordovaProgress.hide();
      });
      $scope.$broadcast('scroll.refreshComplete');
  };

    $scope.rent_req = function(transaction,operation,cancelation_text,item_id){ //handling the rent_req from the item controller side ( for manage items section)
        console.log(transaction,operation,cancelation_text,item_id);
        cancelation_text = typeof cancelation_text !== 'undefined' ? cancelation_text : "";
        var additional_info= {
          TCTX_ID:transaction,
          TRAN_OPER:operation,
          CANCELLATION_TEXT: cancelation_text
        }
        $http({
          withCredentials: true,
          method: 'POST',
          url: 'https://www.whybuy.co.il/rentReq',
          data: {additionalInfo: additional_info}
        })
        .success(function(data, status, headers, config) {
          $state.go("transactions",{itemId: item_id }, {reload: true});
        })
        .error(function(data,status){
          console.log("something failed"+data);
        });
      }; // end of rent req
      $scope.open_dispute = function(transaction,dispute_text,item_id){
        var additional_info= {
          TCTX_ID:transaction,
          TRAN_OPER:'DISPUTE_OPENED',
          DISPUTE_TEXT: dispute_text
        }
        $http({
          withCredentials: true,
          method: 'POST',
          url: 'https://www.whybuy.co.il/rentReq',
          data: {additionalInfo: additional_info}
        })
        .success(function(data, status, headers, config) {
          $state.go("transactions",{itemId: item_id }, {reload: true});
        })
        .error(function(data,status){
          console.log("something failed"+data);
        });
    };
    $scope.feedbackInit = function(){
      $scope.transaction={};
      $scope.transaction.id = $state.params.transactionId;
      $scope.feedback_attributes={};
    };
    $scope.set_star = function(value,attribute){
      $scope.feedback_attributes[attribute]=value;
    };


    $scope.confirmation_scan = function(transaction_id){
      $cordovaBarcodeScanner
        .scan()
        .then(function(barcodeData) {
          var additional_info= {
            TCTX_ID:transaction_id,
            TCTX_TOKEN:barcodeData.text
          };
          $http({
            withCredentials: true,
            method: 'POST',
            url: 'https://www.whybuy.co.il/verifyTransactionToken',
            data: {additionalInfo: additional_info}
          })
          .success(function(data, status, headers, config) {
            $rootScope.showPopup("Handshake","Handshake complete! Thank you");
//            alert("Handshake complete! Thank you");
          })
          .error(function(data,status){
            $rootScope.showPopup("Error","Failed to complete handshake via QR code , please try using numbers instead");
//            alert("Failed to complete handshake via QR code , please try using numbers instead");
          });
        }, function(error) {
          $rootScope.showPopup("Error","Didn't read the QR code - please try again");
//          alert("Didn't read the QR code - please try again");
        });
    };

    $scope.open_send_message_page  = function(id,type){
      $scope.message_type=type;
      $scope.id_message=id;
      $ionicModal.fromTemplateUrl('templates/send_message_modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.send_message = function(message){
        console.log(message,$scope.message_type,$scope.id_message);
        $rootScope.send_message(message,$scope.message_type,$scope.id_message);
        $scope.modal.hide();
    };

});
