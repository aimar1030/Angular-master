angular.module("whybuy.itemController",[])
.controller('itemsCtrl',function($scope,$state,$http,$rootScope,$ionicModal,$cordovaBarcodeScanner,$ionicPopup,$q){
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

  function stopInterval() {
        clearInterval(checkUploadedImages);
  };
  $scope.uploading=false;
  function checkUpload(){
    if (!$scope.obj.flow.isUploading()){
      console.log($scope.obj.flow);
      $scope.processing=false;
      $state.go("home",{}, {reload: true});
      stopInterval();
      $scope.uploading=false;
    } else {
      $scope.uploading=true;
      console.log($scope.obj.flow.isUploading());
      console.log("uploaded"+ $scope.obj.flow.progress()*100);
      $scope.current_progress=Math.floor($scope.obj.flow.progress()*100);
    }
  };
  function prepare_item(item_name,item_description,tags,address,deposit,price,item_rules,cancel_policy){

      var conditions=item_rules.split("\n"); //spliting rules with enters
      var instruction_condictions=[];
      for	(var index = 0; index < conditions.length; index++) {
        console.log(conditions[index]);
        console.log(conditions[index].length);
        if (conditions[index].length > 0){
          instruction_condictions[index]={
            TYPE: "INSTRUCTION",
            DESCRIPTION: conditions[index],
            ENABLED: true
          };
        };
      };
      var categories=tags.split(/[,]+/); //splitting tags
      var additional_info={
        NAME: item_name,
        DESCRIPTION: item_description,
        CATEGORIES: categories,
        ADDRESS: address,
        DEPOSIT:deposit,
        AMOUNT_PER_TIME_UNIT:price,
        CONDITIONS:instruction_condictions,
        CANCELLATION_POLICY:cancel_policy
      };
      return additional_info;
    };
  $scope.delete_file = function(file,index){
    console.log($scope.obj.flow);
    $scope.flow_image_files.splice(index, 1);
    file.flowObj.removeFile(file);
    console.log(file);
  }
  $scope.myItemsInit = function(){
    $scope.loading_items = true;
    $scope.no_items = true;
    console.log("got to my items init");
    $http({
      withCredentials: true,
      method: 'POST',
      url: 'https://www.whybuy.co.il/getUserItems'
    })
    .success(function(data, status, headers, config) {
      $scope.loading_items = false;
      $scope.my_items=data.message;
      $rootScope.my_items=$scope.my_items;
      if ($scope.my_items.length > 0 ){
          $scope.no_items = false;
      };
      console.log($scope.my_items);
    })
    .error(function(data, status, headers, config) {
        $scope.loading_items = false;
    });
  };
  $scope.cancelTransactionInit = function(){
    $scope.transaction={};
    $scope.transaction.id = $state.params.transactionId;
    $scope.transaction.itemID = $state.params.itemId;
    $scope.transaction_side = $state.params.side;
  };


  $scope.rent_req_new = function(uniqueID,price,deposit) {
        if (($scope.period <= 0 ) || (!$scope.end_date)|| (!$scope.start_date))  {
          alert("Please make start and end dates");
          return false;
        };

        if ((price < 1 )||( deposit < 0)||( price > $rootScope.max_per_day ) || ( deposit >  $rootScope.max_deposit)) {
          var alertPopup = $ionicPopup.alert({
             title: 'Pricing Error!',
             template: 'Please check that Deposit is lower than '+$rootScope.max_deposit+' and that price is lower than ' +$rootScope.max_per_day
            });
            alertPopup.then(function(res) {
             console.log('showed pricing error');
            });
            return false;
        };
        if (price * $scope.period > $rootScope.max_rentprice ) {
          var alertPopup = $ionicPopup.alert({
             title: 'Offer Pricing Error!',
             template: 'Total rent price cannot be higher than '+$rootScope.max_rentprice
            });
            alertPopup.then(function(res) {
             console.log('showed pricing error');
            });
            return false;
        };
        $scope.found_conflict=false;
        $scope.item.itemNonAvailabilityDates.forEach(function(entry) {
            entry_date=new Date(entry);
            if (!$scope.found_conflict){
              if ((entry_date > $scope.start_date && entry_date < $scope.end_date)){
                $rootScope.showPopup("Error","The item is not available at the requested dates - please check availablity");
//                alert("The item is not available at the requested dates - please check availablity");
                $scope.found_conflict=true;
                return false;
              };
            };
        });
        if ($scope.found_conflict){
          return false;
        };
        var additional_info={
          TRAN_OPER : 'REQUESTOR_SENT_OFFER',
          ITEM_ID: uniqueID,
          TRAN_START_DATE: format_date($scope.start_date),
          TRAN_END_DATE: format_date($scope.end_date),
          DEPOSIT: deposit,
          AMOUNT_PER_TIME_UNIT: price
        };
        console.log(additional_info);
        $http({
          withCredentials: true,
          method: 'POST',
          url: 'https://www.whybuy.co.il/rentReq',
          data: {additionalInfo: additional_info}
        })
        .success(function(data, status, headers, config) {
          $scope.modal.hide();
          $state.go("myRents",{}, {reload: true});
        })
        .error(function(data, status, headers, config) {
          $rootScope.showPopup("Error","Sending offer failed - please try again later");
//          alert("Sending offer failed - please try again later");
        });
  };
  $scope.on_price_deposit_change = function(price_per_day){
      $scope.price_per_day = price_per_day;
      calculate_price();
      console.log($scope.total_price);
      console.log($scope.price_per_day);
      console.log($scope.period);
  };

  function calculate_price(){
    var moment_start=moment($scope.start_date);
    var moment_end=moment($scope.end_date);
    $scope.period = moment_end.diff(moment_start, 'days') + 1;
    $scope.total_price = $scope.price_per_day * $scope.period;
    $scope.calculated_fee = $scope.period * $scope.price_per_day * ($scope.item.sitePercentageFee/100.0) + parseFloat($scope.item.pwFeeNIS);
  };
  function itemNonAvailabilityDates_array(){
    var disabledDates_array = new Array();
    var array_index=0;
    $scope.item.itemNonAvailabilityDates.forEach(function(entry) {
                disabledDates_array[array_index]=new Date(entry);
                array_index++;
            });
    return disabledDates_array;
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
  $scope.open_send_offer_page = function(id){
      var d = new Date();
      d.setDate(d.getDate() - 1);
      $scope.startDatepickerObject = {
         titleLabel: 'Start Rent Date',  //Optional
         todayLabel: 'Today',  //Optional
         closeLabel: 'Close',  //Optional
         setLabel: 'Set',  //Optional
         errorMsgLabel : 'Please select time.',    //Optional
         setButtonType : 'button-assertive',  //Optional
         inputDate: new Date(),    //Optional
         mondayFirst: true,    //Optional
         disabledDates:itemNonAvailabilityDates_array(),  //Optional
         from: d,   //Optional
         //to: new Date(2015, 7, 29),    //Optional
         callback: function (val) {    //Mandatory
           $scope.start_date=val;
           console.log(val);
         }
       };
       $scope.endDatepickerObject = {
          titleLabel: 'End Rent Date',  //Optional
          todayLabel: 'Today',  //Optional
          closeLabel: 'Close',  //Optional
          setLabel: 'Set',  //Optional
          errorMsgLabel : 'Please select time.',    //Optional
          setButtonType : 'button-assertive',  //Optional
          inputDate: new Date(),    //Optional
          mondayFirst: true,    //Optional
          disabledDates:itemNonAvailabilityDates_array(),
          from: d,   //Optional
          //to: new Date(2015, 7, 29),    //Optional
          callback: function (val) {    //Mandatory
            $scope.end_date=val;
            console.log(val);
            calculate_price();
          }
        };
        $scope.price_per_day = $scope.item.itemInfo.amountPerTimeUnit;
        $scope.deposit = $scope.item.itemInfo.protectionAmount;


      $ionicModal.fromTemplateUrl('templates/send_offer_modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
  };
  $scope.no_transactions = true;
  $scope.itemsTransactionsInit = function(){
    $scope.side='owner';
    $scope.loading_transactions=true;
      var additional_info= {
        ITEM_ID: $state.params.itemId
      }
      $http({
        withCredentials: true,
        method: 'POST',
        url: 'https://www.whybuy.co.il/getUserScenes',
        data: {additionalInfo: additional_info}
      })
      .success(function(data, status, headers, config) {
        console.log(data);
        $scope.transactions=data.message;
        $scope.loading_transactions=false;
        if (JSON.stringify(data.message) != '{}'){
            $scope.no_transactions = false;
        };
      });
      $scope.$broadcast('scroll.refreshComplete');
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
      $rootScope.showPopup("Error","Failed to create QR code please try again later or validate via numbersy");
        //alert('Failed to create QR code please try again later or validate via numbers');
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
//          alert("Handshake complete! Thank you");
        })
        .error(function(data,status){
          $rootScope.showPopup("Error","Failed to complete handshake via QR code , please try using numbers instead");
        //  alert("Failed to complete handshake via QR code , please try using numbers instead");
        });
      }, function(error) {
        $rootScope.showPopup("Error","Didn't read the QR code - please try again");
        //alert("Didn't read the QR code - please try again");
      });
  };
  function getItemDetails(item_id){
    var additional_info={
      ITEM_ID: item_id
    };
    $http({
        method: 'POST',
        url: 'https://www.whybuy.co.il/getItem',
        data: {additionalInfo: additional_info}
    })
    .success(function(data, status, headers, config) {
      $scope.item=data.message;
      console.log(data);
    })
    .error(function(data, status, headers, config) {
        console.log("failed to get Item");
    });
  };
  $scope.ItemDetailsinit = function(){
      item_id = $state.params.itemId;
      getItemDetails(item_id);
  };
  $scope.pics=[];
  $scope.temp_pics=[];
  $scope.obj={};
  $scope.flow_image_files=[];

  Array.prototype.contains = function(v) {
          for(var i = 0; i < this.length; i++) {
              if(this[i] === v) return true;
          }
          return false;
      };

      Array.prototype.unique = function() {
          var arr = [];
          for(var i = 0; i < this.length; i++) {
              if(!arr.contains(this[i])) {
                  arr.push(this[i]);
              }
          }
          return arr;
      }

  $scope.upload_files = function(event,flow){
        console.log(event,flow);
        console.log("got to flow");
        flow.files.forEach(function(file) {
            console.log(file);
            file.resume();
            var image={};
            image.URL=file.uniqueIdentifier;
            image.FILE_NAME=file.file.name;
            $scope.temp_pics.push(image);
            $scope.flow_image_files.push(file);
            $scope.current_image=file.file;
        });
        $scope.flow_image_files = $scope.flow_image_files.unique();

  };

  $scope.fillout_fields=false;
  $scope.add_product = function(tags,address,deposit,price,item_rules,item_description,item_name,cancel_policy,addProductForm){
    if (!tags || !address || ! deposit || !price || !item_rules || !item_description || !item_name || !cancel_policy){
      console.log("please fill out all the fields");
      $scope.fillout_fields=true;
      return false;
    };
      if (!$rootScope.loggedIn){
            console.log("got to add product1");
      } else { // logged in user
            console.log("got to add product2");
        if (!addProductForm.$valid){ // If the form is not valid
          console.log("got to invalid form");
        };
        if ((deposit > $rootScope.max_deposit )||(price > $rootScope.max_per_day )) {
          var alertPopup = $ionicPopup.alert({
             title: 'Pricing Error!',
             template: 'Please check that Deposit is lower than '+$rootScope.max_deposit+' and that price is lower than ' +$rootScope.max_per_day
            });
            alertPopup.then(function(res) {
             console.log('showed pricing error');
            });
            return false;
        };

        $scope.processing=true;
        var additional_info=prepare_item(item_name,item_description,tags,address,deposit,price,item_rules,cancel_policy);
        additional_info.ITEM_ID=$scope.item_id;
        additional_info.PICTURES = $scope.temp_pics;
        var url='';
        if ($scope.item_id){
          url='https://www.whybuy.co.il/editItem';
        } else {
          url='https://www.whybuy.co.il/addItem';
        }
        $http({
          withCredentials: true,
          method: 'POST',
          url: url,
          data: {additionalInfo: additional_info}
        })
        .success(function(data, status, headers, config) {
              console.log(data);
              $scope.tags='';
              $scope.address='';
              $scope.deposit='';
              $scope.price='';
              $scope.item_rules='';
              $scope.item_description='';
              $scope.item_name='';
              $scope.cancel_policy='';
              $scope.addProductForm='';
              checkUploadedImages = setInterval(function(){ checkUpload() }, 100);
          })
          .error(function(data, status, headers, config) {
            $scope.processing=false;
            console.log("something went wrong");
            console.log(data);
          });
      };
    }; // End of add product function
    $scope.open_cancelation_policy_help = function(){
      $ionicModal.fromTemplateUrl('templates/cancelation_policy_help.html', {
      scope: $scope,
      animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };
    $scope.editItemInit = function(){
        $scope.profile_loaded=false;
        $scope.update_profile();
        if ($state.params.itemId){
            item_id = $state.params.itemId;
            $scope.item_id = $state.params.itemId;
            getItemDetails(item_id);
              $scope.$watch('item', function(newValue, oldValue) {
                if ($scope.item){
                  $scope.item_name=$scope.item.itemInfo.name;
                  $scope.item_description=$scope.item.itemInfo.personalAttributesMap.DESCRIPTION.value;
                  $scope.tags=$scope.item.itemInfo.hashTags.toString();
                  $scope.address=$scope.item.itemInfo.address;
                  $scope.deposit=$scope.item.itemInfo.protectionAmount;
                  $scope.price=$scope.item.itemInfo.amountPerTimeUnit;
                  $scope.item_rules="";
                  angular.forEach($scope.item.itemInfo.conditions, function(value, key) {
                    $scope.item_rules +=value.description+"\r\n";
                  });
                  $scope.cancel_policy=$scope.item.itemInfo.cancellationPolicy;
                  $scope.pics=$scope.item.itemInfo.pics.MEDIUM;
                };
              });
        } else {
          $scope.item_id == null;
        };
    };
    $scope.remove_item = function(item_id){
      console.log(item_id);
      var additional_info={
        ITEM_ID: item_id
      };
      $http({
        withCredentials: true,
        method: 'POST',
        url: 'https://www.whybuy.co.il/removeItem',
        data: {additionalInfo: additional_info}
      })
      .success(function(data, status, headers, config) {
            console.log(data);
            $scope.myItemsInit();
            $state.go("home",{}, {reload: true});
        })
        .error(function(data, status, headers, config) {
          console.log("failed to delete item");
        });
    }; // End of remove Item
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
          if ($scope.transaction_side == 'owner') {
                $state.go("transactions",{itemId: item_id }, {reload: true});
          };
          if ($scope.transaction_side == 'renter')  {
                $state.go("myRents", {reload: true});
          };
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

    $scope.remove_image = function(url){
      var additional_info={
        ITEM_ID: $scope.item_id,
        URL: url
      };
      $http({
        withCredentials: true,
        method: 'POST',
        url: 'https://www.whybuy.co.il/removeImage',
        data: {additionalInfo: additional_info}
      })
      .success(function(data, status, headers, config) {
            $state.go("editItem",{ itemId: $scope.item_id }, {reload: true});
        })
        .error(function(data, status, headers, config) {

        });
    };

    $scope.send_feedback = function(id,feedback_text,side){
      $scope.disable_feedback_button= true;
      if ($scope.feedback_attributes['overall_satisfaction']==0){
        $scope.feedback_attributes['overall_satisfaction']='neutral';
      };
      var missing_field = false;
          var additional_info= {
            TCTX_ID:id,
            RESPONSIVENESS:$scope.feedback_attributes['responsiveness'],
            FEEDBACK_TEXT :feedback_text
          };
          if (side == 'requestor') {
            if (($scope.feedback_attributes['item_as_described'])&&($scope.feedback_attributes['responsiveness'])&&(feedback_text)&&($scope.feedback_attributes['overall_satisfaction'])&&($scope.feedback_attributes['value'])){
              additional_info.ITEM_AS_DESCRIBED=$scope.feedback_attributes['item_as_described'];
              additional_info.TRAN_VALUE=$scope.feedback_attributes['value'];
              if ($scope.feedback_attributes['overall_satisfaction']=='neutral'){
                $scope.feedback_attributes['overall_satisfaction']=0;
                additional_info.OVERALL_SATISFACTION=$scope.feedback_attributes['overall_satisfaction'];
              }
            } else {
              console.log($scope.feedback_attributes['item_as_described'],$scope.feedback_attributes['responsiveness'],feedback_text,$scope.feedback_attributes['overall_satisfaction'],$scope.feedback_attributes['value']);
              missing_field = true;
            };
          };
          if (side == 'owner') {
            if (($scope.feedback_attributes['return_condition'])&&($scope.feedback_attributes['responsiveness'])&&(feedback_text)){
              additional_info.RETURN_CONDITION = $scope.feedback_attributes['return_condition'];
              if ($scope.feedback_attributes['overall_satisfaction']=='neutral'){
                $scope.feedback_attributes['overall_satisfaction']=0;
                additional_info.OVERALL_SATISFACTION=$scope.feedback_attributes['overall_satisfaction'];
              }
            } else {
              console.log($scope.feedback_attributes['return_condition'],$scope.feedback_attributes['responsiveness'],feedback_text);
              console.log("got here 2");
              missing_field = true;
            };
          };
        if (missing_field) {
          console.log($scope.feedback_attributes);
          $rootScope.showPopup("Error","Please fill out fields");
//          alert("please fill out fields");
          return false;
        };
        console.log(additional_info);
        $http({
          withCredentials: true,
          method: 'POST',
          url: 'https://www.whybuy.co.il/addFeedback',
          data: {additionalInfo: additional_info}
        })
        .success(function(data, status, headers, config) {
          $rootScope.showPopup("Feedback","thanks for your feedback");
//          alert("thanks for your feedback");
          if (side=='requestor') {
            state.go('myRents', {reload: true});
          };
          if (side=='owner'){
            state.go('home', {reload: true});
          };
          console.log(data);
        })
        .error(function(data,status){
          $scope.disable_feedback_button= false;
          $rootScope.showPopup("Error","Failed to send feedback please try again later");
//          alert("Failed to send feedback please try again later");
        });
    };

    $scope.set_item_active = function(item_id,new_status,item_id){
        if (new_status){
          var active = "true";
        } else {
          var active = "false";
        };
        var additional_info={
          ITEM_ID: item_id,
          ACTIVE: active
        };
        $http({
          withCredentials: true,
          method: 'POST',
          url: 'https://www.whybuy.co.il/editItem',
          data: {additionalInfo: additional_info}
        })
        .success(function(data, status, headers, config) {
          //$state.go("itemDetails",{ itemId: item_id }, {reload: true});
          $scope.ItemDetailsinit();
        })
        .error(function(data, status, headers, config) {
          $rootScope.showPopup("Error","Failed to change item state - please try again");
//          alert("Failed to change item state - please try again ");
        });
    };
    $scope.open_other_profile = function(user_id){
        if (user_id){
            $state.go("profile",{ userId: user_id }, {reload: true});
        };

    };
    $scope.update_profile = function(){
      $http({
          withCredentials: true,
          method: 'POST',
          url: 'https://www.whybuy.co.il/editUserProfile'
        })
        .success(function(data, status, headers, config) {
          $rootScope.profile=data.message;
          console.log($rootScope.profile.userTrustInfo.emailVerified)
          console.log($rootScope.profile);
          $scope.profile_loaded=true;
        });
    };

    $scope.loadItems = function(query){
    var lower_case_query=query.toLowerCase();
    var data = new Array();
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: 'https://www.whybuy.co.il/getAllTags'

    })
    .success(function(result_data, status, headers, config) {
      var data = new Array();
      angular.forEach(result_data.message, function(value, key) {
        var low_case_value=value.toLowerCase();
        if (low_case_value.indexOf(lower_case_query) > -1){
            data.push({"text":value});
        };
      });
      deferred.resolve(data);
      return data;
    })
    .error(function(result_data, status, headers, config) {
      deferred.resolve(data);
      return data;
    });
    return deferred.promise;
  };

    $scope.submit_paypal_id = function(paypal_id){
      console.log(paypal_id);
        if (!paypal_id){
              $rootScope.showPopup("Error","Please fill out Paypal ID field");
            //  alert("Please fill out Paypal ID field");
              return false;
        };
        var additional_info={
          PAYPAL_ID: paypal_id
        };
        $http({
          withCredentials: true,
          method: 'POST',
          url: 'https://www.whybuy.co.il/paypalOperation',
          data: {additionalInfo: additional_info}
        })
        .success(function(data, status, headers, config) {
          $rootScope.showPopup("PayPal","PayPal Account updated succesfully");
            //alert("PayPal Account updated succesfully");
            $rootScope.profile.userIdentity.marketRelatedInfo.sellerInfo.sellerInfoMap.PAYPAL_ID=paypal_id;
            $scope.update_profile();
            $scope.editItemInit();
        })
        .error(function(data, status, headers, config) {
          $rootScope.showPopup("Error","PayPay ID update failed please try again");
          //alert("PayPay ID update failed please try again ");
        });
    };
    $scope.submit_payme_seller = function(bank_account_name,seller_bank_code,seller_bank_branch,seller_bank_account_number){
      if ((!bank_account_name)||(!seller_bank_code)||(!seller_bank_branch)||(!seller_bank_account_number)){
        $rootScope.showPopup("Error","Please fill out all the fields");
            //alert("Please fill out all the fields");
      };
      var additional_info={
        OPER: 'create-seller',
        FIRST_NAME : bank_account_name,
        seller_bank_code: seller_bank_code,
        seller_bank_branch: seller_bank_branch,
        seller_bank_account_number:  seller_bank_account_number
      };
      $http({
        withCredentials: true,
        method: 'POST',
        url: 'https://www.whybuy.co.il/paymeOperation',
        data: {additionalInfo: additional_info}
      })
      .success(function(data, status, headers, config) {
        $rootScope.showPopup("Bank Account Details","Your bank account details were succesfully updated");
    //      alert("Your bank account details were succesfully updated");
          $rootScope.profile.userIdentity.marketRelatedInfo.sellerInfo.sellerInfoMap.BANK_ACCOUNT_NUMBER=seller_bank_account_number;
          $scope.update_profile();
          $scope.editItemInit();
      })
      .error(function(data, status, headers, config) {
        $rootScope.showPopup("Error","Failed to update your bank account details please try again");
//        alert("Failed to update your bank account details please try again ")
      });
    };
    $scope.email_validation = function(){
      $http({
        withCredentials: true,
        method: 'POST',
        url: 'https://www.whybuy.co.il/registerUserRV'
      })
      .success(function(data, status, headers, config) {
        $rootScope.showPopup("Email Confirmation","Confirmation email was sent - please check your mailbox");
        // alert("Confirmation email was sent - please check your mailbox");
      })
      .error(function(data, status, headers, config) {
        $rootScope.showPopup("Error","Failed to send confirmation email - please try again");
        //alert("Failed to send confirmation email - please try again ");
      });
    };
});
