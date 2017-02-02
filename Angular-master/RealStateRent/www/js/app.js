(function(){
var app = angular.module('whybuy', ['ionic','ionic.service.core','ngCordova','ionic.service.push','whybuy.itemController','whybuy.rentController','flow','ngWebsocket','ngMap','satellizer','ionic-datepicker','ngTagsInput','ionic.service.core',

])

app.factory('httpInterceptor', function httpInterceptor ($q, $window, $location,$rootScope,$injector) {
  return {
    'response': function(response) {
      return response;
    },
   'responseError': function(rejection) {
     console.log("got to response error");
     console.log(rejection);
     if (rejection.status == 428) {

     };
     if (rejection.status == 401) {
       console.log("logged out");
       localStorage.removeItem('user_logged');
       $rootScope.loggedIn = false;
       $injector.get('$state').transitionTo('login');
     };
    return $q.reject(rejection);
    }
  }
})

app.config(function($stateProvider,$urlRouterProvider,$httpProvider,flowFactoryProvider,$authProvider,$compileProvider){
     $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|geo|tel|http|waze):/);
    $authProvider.httpInterceptor = false;
    var commonConfig = {
       popupOptions: {
         location: 'no',
         toolbar: 'no',
         width: window.screen.width,
         height: window.screen.height
       }
     };
     if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
       $authProvider.cordova = true;
       commonConfig.redirectUri = 'http://localhost/';
     }

  $authProvider.facebook(angular.extend({}, commonConfig, {
    //responseType: 'token',
    clientId: '508491679315745',
    url: 'https://www.whybuy.co.il/facebookLogin',
    authorizationEndpoint: 'https://www.facebook.com/dialog/oauth',
    //redirectUri: window.location.protocol + '//' + window.location.host + '/landing.html',
    scope: ['email','user_friends','public_profile'],
    scopeDelimiter: ',',
    requiredUrlParams: ['display', 'scope'],
    // display: 'popup',
    type: '2.0',
    popupOptions: { width: 481, height: 269 }
  }));

 //  $ionicAppProvider.identify({
 //   // The App ID (from apps.ionic.io) for the server
 //   app_id: '01e6d2fd',
 //   // The public API key all services will use for this app
 //   api_key: '7ba9a7637be0a9867f7e0043d1f8ff824339fc1d2888214a',
 //   // Set the app to use development pushes
 //   gcm_id: '142738311658'
 //   //AIzaSyBcrv9UFnH2p75ystJnXMABsaJCpdvn0YE
 // });

  $httpProvider.interceptors.push('httpInterceptor');

  $stateProvider.state('about',{
      cache: false,
      url:'/about',
      templateUrl: 'templates/about.html'
  });

  $stateProvider.state('search',{
      //cache: false,
      url:'/search',
      controller: 'searchCtrl',
      templateUrl: 'templates/search.html'
  });

  $stateProvider.state('updates',{
      //cache: false,
      url:'/updates',
      controller: 'updatesCtrl',
      templateUrl: 'templates/updates.html'
  });

  $stateProvider.state('terms',{
      //cache: false,
      url:'/terms',
      //controller: 'searchCtrl',
      templateUrl: 'templates/terms.html'
  });

  $stateProvider.state('home',{
      cache: false,
      url:'/myItems',
      templateUrl: 'templates/myItems.html',
      controller: 'itemsCtrl'
  });
  $stateProvider.state('login',{
      cache: false,
      url:'/login',
      templateUrl: 'templates/Login.html',
      controller: 'loginCtrl'
  });
  $stateProvider.state('register',{
      cache: false,
      url:'/register',
      templateUrl: 'templates/register.html',
      controller: 'loginCtrl'
  });

  $stateProvider.state('cancel_transaction',{
      cache: false,
      url:'/cancel_transaction/:transactionId/:itemId/:side',
      templateUrl: 'templates/cancel_transaction.html',
      controller: 'itemsCtrl'
  });
  $stateProvider.state('dispute_transaction',{
      cache: false,
      url:'/dispute_transaction/:transactionId/:itemId',
      templateUrl: 'templates/dispute_transaction.html',
      controller: 'itemsCtrl'
  });
  $stateProvider.state('feedback',{
      cache: false,
      url:'/feedback/:transactionId',
      templateUrl: 'templates/feedback.html',
      controller: 'itemsCtrl'
  });
  $stateProvider.state('requestorFeedback',{
      cache: false,
      url:'/requestorFeedback/:transactionId',
      templateUrl: 'templates/requestorFeedback.html',
      controller: 'itemsCtrl'
  });


  $stateProvider.state('itemDetails',{
      cache: false,
      url:'/itemDetails/:itemId',
      templateUrl: 'templates/itemDetails.html',
      controller: 'itemsCtrl'
  });
  $stateProvider.state('item',{
      cache: false,
      url:'/item/:itemId',
      templateUrl: 'templates/item.html',
      controller: 'itemsCtrl'
  });
  $stateProvider.state('profile',{
      cache: false,
      url:'/profile/:userId',
      templateUrl: 'templates/profile.html',
      controller: 'profileCtrl'
  });
  $stateProvider.state('newItem',{
      cache: false,
      url:'/newItem',
      templateUrl: 'templates/newItem.html',
      controller: 'itemsCtrl'
  });
  $stateProvider.state('editItem',{
      cache: false,
      url:'/editItem/:itemId',
      templateUrl: 'templates/newItem.html',
      controller: 'itemsCtrl'
  });
  $stateProvider.state('transactions',{
      cache: false,
      url:'/transactions/:itemId',
      templateUrl: 'templates/transactions.html',
      controller: 'itemsCtrl'
  });
  $stateProvider.state('conversation',{
      cache: false,
      url:'/conversation/:threadId',
      templateUrl: 'templates/conversation.html',
      controller: 'messagesCtrl'
  });

  $stateProvider.state('messages',{
      cache: false,
      url:'/messages',
      templateUrl: 'templates/messages.html',
      controller: 'messagesCtrl'
  });
  $stateProvider.state('myRents',{
      cache: false,
      url:'/myRents',
      templateUrl: 'templates/myRents.html',
      controller: 'rentsCtrl'
  });

  $urlRouterProvider.otherwise('search');
  flowFactoryProvider.defaults = {
      target: 'https://www.whybuy.co.il/upload',
      permanentErrors: [404, 500, 501,401,403],
      uploadMethod: 'POST',
      maxChunkRetries: 1,
      chunkRetryInterval: 5000,
      simultaneousUploads: 4,
      testChunks:false,
      withCredentials: true
    };
});

app.controller('searchCtrl',function($scope,$http,$rootScope,$state,$ionicPush,$ionicPopup,$cordovaProgress,$cordovaGeolocation,$ionicModal){

      var rad = function(x) {
        return x * Math.PI / 180;
      };

      $scope.getDistance = function(p1, p2) {
      //  console.log(p1,p2);
        var R = 6378137; // Earth’s mean radius in meter
        var dLat = rad(p2.lat - p1.lat);
        var dLong = rad(p2.lng - p1.lng);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
          Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return Math.round(d)/1000; // returns the distance in meter
      };
      function array_unique(arr) {
        var result = [];
        for (var i = 0; i < arr.length; i++) {
            if (result.indexOf(arr[i]) == -1) {
                result.push(arr[i]);
            }
        }
        return result;
      };
      $scope.max_price=1500;
      $scope.distance_range=1020;
      $scope.current_location = {};
      $scope.current_location.lat = 0;
      $scope.current_location.lng = 0;

      $scope.location_array = new Array();
      $scope.set_distance = function(product){
          if (navigator.geolocation){
              //$scope.distance_array[product._id] = Math.round(getDistance($scope.current_location,product.data.geometry.location))/1000;
              $scope.location_array[product._id] = product.data.geometry.location;
          };
          //$scope.$apply();
          //      console.log($scope.location_array);
      };
      $scope.open_results_on_map = function(results){
        $ionicModal.fromTemplateUrl('templates/results_on_map_modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.modal = modal;
          $scope.modal.show();
        });
      };

      $scope.$on('mapInitialized', function(event, map) {
          google.maps.event.trigger(map,'resize');
          console.log(map);

      });
      $scope.marker_click=function(){
        window.location.href = this.url;
        $scope.modal.hide();
      };
      $scope.processing=false;
      var posOptions = {
                  enableHighAccuracy: true
      };

      $scope.perform_search = function(search_term){
      $scope.processing=true;
      if ((!search_term)||(search_term.length < 2)) {
        $rootScope.showPopup("Missing charaters","please enter at least 2 characters");
        //alert("please enter at least 2 characters");
        $scope.processing=false;
        return false;
      }
      var additional_info={
        SEARCH_TERM: search_term
      };
      $http({
        method: 'POST',
        url: 'https://www.whybuy.co.il/search',
        data: {additionalInfo: additional_info}
      })
      .success(function(data, status, headers, config) {
        //  $cordovaProgress.hide();
          $scope.processing=false;
          $scope.empty_result=false;
          console.log(data);
          $scope.tags=array_unique(data.message[1]);
          $scope.results=data.message[0];
          if (JSON.stringify($scope.results)=="[]"){
            $scope.empty_result=true;
          } else {
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                $scope.current_location.lat = position.coords.latitude;
                $scope.current_location.lng = position.coords.longitude
                $scope.geolocation = true;
                //$scope.$apply();
            }, function(err) {
              $rootScope.showPopup("Enable GPS","cannot access your location - please enable wifi or GPS and try again");
              //alert("cannot access your location - please enable wifi or GPS and try again");
              $scope.geolocation = false;
            });
        };
      })
      .error(function(data, status, headers, config) {
    //    $cordovaProgress.hide();
        console.log(data);
        $scope.processing=false;
      });
    };
    $scope.open_item = function(item_id){
      console.log(item_id);
      $state.go("item",{itemId: item_id }, {reload: true});
    };

});
app.controller('updatesCtrl',function($scope,$http,$rootScope,$state,$ionicPush,$ionicPopup){
  $rootScope.$on('newNotication',function(scope,data){
        console.log('got to newNotication');
           $scope.myUpdatesInit();
  });
  $scope.handle_click = function(notification){

       var additional_info = {
         MESSAGE_ID:notification.messageID
       };
       $http({
         withCredentials: true,
         method: 'POST',
         url: 'https://www.whybuy.co.il/msgBoxMarkMessage',
         data: {additionalInfo: additional_info}
       })
       .success(function(data, status, headers, config) {
           $scope.myUpdatesInit();
       })
        $scope.notification_link(notification);
  };
  $scope.notification_link = function(notification){
      if (notification.notification_additional_info.event=='transactionUpdate'){
        if (notification.notification_additional_info.OWNER==true) {
          //return '/transactions/'+notification.notification_additional_info.ITEM_ID;
          $state.go("transactions",{itemId: notification.notification_additional_info.ITEM_ID }, {reload: true});
        } else {
          $state.go("myRents", {reload: true});
          // return '/myRents';
        }
      } else {
          $state.go("messages", {reload: true});
          //return '/messages';
      }
  };
  $scope.myUpdatesInit = function(){
        $scope.loading_updates=true;
        $scope.new_notifications_badge=false;
        $rootScope.notification_indicator=false;
          $http({
            withCredentials: true,
            method: 'POST',
            url: 'https://www.whybuy.co.il/msgBoxGetMessages'
          })
          .success(function(data, status, headers, config) {
          //  console.log(data);
            $scope.notifications = data.message;
            if (data.message.length < 1) {
              $scope.no_updates=true;
            } else {
                var  new_notifications_array=new Array();
                angular.forEach($scope.notifications, function(value, key) {
                  value.notification_additional_info=JSON.parse(value.additionalInfo);
                  new_notifications_array.push(value);
                  if (!value.isMessageRead){
                    $scope.new_notifications_badge++;
                  };
                });
                $scope.notifications=new_notifications_array;
                $rootScope.notification_indicator=$scope.new_notifications_badge;
            };
          })
          .error(function(data, status, headers, config) {
            console.log(data);
          });
          $scope.loading_updates=false;
          $scope.$broadcast('scroll.refreshComplete');
      };
});

app.controller('profileCtrl',function($scope,$http,$rootScope,$state,$ionicPush,$ionicPopup){
  $scope.getNumber = function(num) {
        return new Array(num);
  };


  $scope.open_item = function(item_id){
    $state.go("item",{itemId: item_id }, {reload: true});
  };
  $scope.profileInit = function(){
    var id= $state.params.userId;
    var additional_info = {
      UNIQUE_ID: id
    };

    $http({
      withCredentials: true,
      method: 'POST',
      url: 'https://www.whybuy.co.il/getProfile',
      data: {additionalInfo: additional_info}
    })
    .success(function(data, status, headers, config) {
      console.log(data);
      $scope.profile = data.message.userProfileInfo;
      $scope.items = data.message.userItemsInfo;
      $scope.reviews= data.message.userReviews;
      $scope.userTrustInfo = data.message.userProfileInfo.data.userTrustInfo;
    });
  };
});
app.controller('loginCtrl',function($scope,$http,$rootScope,$state,$ionicPopup,$auth,$cordovaInAppBrowser,$ionicModal,$ionicPlatform,$ionicPush){
  $scope.processing=false;
  $scope.user_name='';
  $scope.password='';
  $scope.open_link = function(url){
    var options = {
       location: 'yes',
       toolbar: 'yes'
     };
    $cordovaInAppBrowser.open(url, '_blank', options);
  }
  function meetsMinimumAge(birthDate) {
    console.log(birthDate);
    var minAge = Number(18);
    var year = birthDate.getFullYear();
    var month = birthDate.getMonth();
    var day = birthDate.getDate();
    var tempDate = new Date(year + minAge, month, day);
    //console.log(tempDate,new Date());
    return (tempDate <= new Date());
  };

  $scope.birthdateObj = {
     titleLabel: 'Please select your birthdate',  //Optional
     todayLabel: 'Today',  //Optional
     closeLabel: 'Close',  //Optional
     setLabel: 'Set',  //Optional
     errorMsgLabel : 'Please select time.',    //Optional
     setButtonType : 'button-assertive',  //Optional
     inputDate: new Date(),    //Optional
     mondayFirst: true,    //Optional
     //from: d,   //Optional
     //to: new Date(2015, 7, 29),    //Optional
     callback: function (val) {    //Mandatory
       if (!meetsMinimumAge(val)){
         $rootScope.showPopup("Error","You must be at least 18 to sign up");
         //alert ("You must be at least 18 to sign up");
         return false;
       } else {
         $scope.birthdate=val;
       }
     }
   };

  function format_date(datetoformat){
    var year = datetoformat.getFullYear();
    var month = datetoformat.getMonth() + 1;
    if (month < 10) {
      month = "0" + month;
    };
    var day = datetoformat.getDate();
    if (day < 10){
        day ="0" + day;
    }
    return day+"/"+month+"/"+year;
  };

  $scope.signup = function(full_name,user_name,password,phone){
    console.log(full_name,user_name,password,phone);
    if ((!full_name)||(!user_name)||(!password)||(!phone)){
      $rootScope.showPopup("Missing Input","Please fill out all fields");
        //alert("Please fill out all fields");
        return false;
    };
    if (phone.indexOf("+972") < 0) {
      $rootScope.showPopup("Phone validation","Please make sure the phone starts with +972");
      //alert("");
      return false;
    };
    var additional_info={
      FIRST_NAME: full_name,
      USER_NAME:  user_name,
      PASSWORD: password,
      BIRTH_DATE: format_date($scope.birthdate),
      PHONE: phone
    };
    var serverIp=$rootScope.serverIp;
    $http({
      withCredentials: true,
      method: 'POST',
      url: 'https://www.whybuy.co.il/registerUser',
      data: {additionalInfo: additional_info}
    })
    .success(function(data, status, headers, config) {
      $rootScope.showPopup("Email Confirmation","Thanks for signing up please check your mailbox for email confirmation");
      //alert('Thanks for signing up please check your mailbox for email validation');
      succefull_authentication();
    })
    .error(function(data, status, headers, config) {
      $rootScope.showPopup("Error","Failed to sign up - please try again");
        //alert("Failed to sign up - please try again");
    });
  };

  function registerForNotifcations(){
    $ionicPlatform.ready(function() {
      Ionic.io();

      var push = new Ionic.Push({
        "debug": true
      });

      push.register(function(token) {
        console.log("Device token:",token.token);
        var additional_info = {
          PHONE_TOKEN : token.token
        };
        $http({
            withCredentials: true,
            method: 'POST',
            url: 'https://www.whybuy.co.il/updateUserPhoneToken',
            data: {additionalInfo: additional_info}
          })
          .success(function(data, status, headers, config) {
                  $rootScope.profile=data.message;
          });
      });
    });
  };








  function succefull_authentication(){
      localStorage.setItem('user_logged',true);
      $rootScope.loggedIn = true;
      $http({
          withCredentials: true,
          method: 'POST',
          url: 'https://www.whybuy.co.il/editUserProfile'
        })
        .success(function(data, status, headers, config) {
          $rootScope.profile=data.message;
          registerForNotifcations();
        });
      if(localStorage.getItem("last_location")){
        $state.go('last_location');
      } else {
        $state.go('home',{}, {reload: true});
      }
      localStorage.removeItem("last_location");
      $rootScope.$emit('newNotication', "not important");
    };
    $scope.facebook_login_in_progress = false;
    $scope.authenticate = function(provider) {
      $scope.facebook_login_in_progress = true;
      $auth.link(provider).then(function(response) {
        succefull_authentication();
        console.log(" authenticated");
        console.log(response);
        $scope.facebook_login_in_progress = false;
      })
      .catch(function(data){
        $scope.facebook_login_in_progress=false;
        $rootScope.showPopup("Error","Failed to sign up - please try again");
        //alert(data);
      });
    };


  $scope.reset_password = function(email_for_reset){ // handling initial submition of email
    var additional_info={
      USER_NAME: email_for_reset
    };
    $http({
      withCredentials: true,
      method: 'POST',
      url: 'https://www.whybuy.co.il/resetUserPass',
      data: {additionalInfo: additional_info}
    })
    .success(function(data, status, headers, config) {
      $rootScope.showPopup("Password Reset","Reset Password link was sent to your email");
      //alert("Reset Password link was sent to your email");
    })
    .error(function(data, status, headers, config) {
      $rootScope.showPopup("Error","Failed to generate link for password reset - please try again");
      //alert("Failed to generate link for password reset - please try again");
    });
    $scope.user_name="";
    $scope.modal.hide();
  };
  $scope.open_password_reset_modal = function(){
    $ionicModal.fromTemplateUrl('templates/password_reset_modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };
  $scope.perform_login = function(user_name,password){
    $scope.processing=true;
    var additional_info={
      USER_NAME: user_name,
      PASSWORD: password
    };
    var requestData ={'additionalInfo':additional_info };

    $http({
      withCredentials: true,
      method: 'POST',
      url: 'https://www.whybuy.co.il/login',
      data: {additionalInfo: additional_info}
    })
    .success(function(data, status, headers, config) {
      succefull_authentication();
      $scope.processing=false;
      $rootScope.loggedIn=true;
      localStorage.setItem('user_logged', true);
    })
    .error(function(data, status, headers, config) {
      console.log("failed to login");
      console.log(status);
      $scope.processing=false;
      var alertPopup = $ionicPopup.alert({
        title: 'Login Failure',
        template: 'Please check your username and password and try again'
      });
      alertPopup.then(function(res) {
        console.log(res);
      });
    });
    $scope.password="";
  };
});
app.controller('messagesCtrl',function($scope,$http,$rootScope,$state,$ionicScrollDelegate){
  $scope.messagesInit = function(){
      $scope.no_conversations = true;
      $scope.loading_conversations=true;
      $http({
        withCredentials: true,
        method: 'POST',
        url: 'https://www.whybuy.co.il/getConversations'
      })
      .success(function(data, status, headers, config) {
        $scope.loading_conversations=false;
        console.log(data);
        $scope.threads=data.message;
        if (data.message.length > 0){
            $scope.no_conversations = false;
        };
      })
      .error(function(data, status, headers, config) {
        $scope.loading_conversations=false;
      });
      $scope.$broadcast('scroll.refreshComplete');
  };
  $rootScope.$watch('profile',function(){
     if ($rootScope.profile){
       console.log($rootScope.profile);
       $scope.my_uniqid=$rootScope.profile.userIdentity.uniqueID;
       console.log($scope.my_uniqid);
     };
  });
  $scope.getOtherParticipant= function(participants){
    angular.forEach(participants, function(value, key) {
      console.log(value.uniqueID,$scope.my_uniqid);
       if  (value.uniqueID!=$scope.my_uniqid){
         $scope.other_participant= value;
       }
    });
  };
  $scope.conversationInit = function(){
    $scope.loading_thread_messages = true;
    $scope.thread_id = $state.params.threadId;
      var additional_info = {
        CONVERSATION_ID : $scope.thread_id
      };
      $http({
      withCredentials: true,
      method: 'POST',
      url: 'https://www.whybuy.co.il/getConversation',
      data: {additionalInfo: additional_info}
    })
    .success(function(data, status, headers, config) {
      $scope.messages=data.message.data.messages;
      $ionicScrollDelegate.scrollBottom(true);
      $scope.loading_thread_messages = false;
      console.log($scope.messages);
    })
    .error(function(data, status, headers, config) {
      $scope.loading_thread_messages = false;
    });
    $scope.$broadcast('scroll.refreshComplete');
  }
  $scope.messageForm={};
  $scope.send_message = function(message_text){
      var additional_info = {
        CONVERSATION_ID : $scope.thread_id,
        MESSAGE:message_text
      };
      $http({
        withCredentials: true,
        method: 'POST',
        url: 'https://www.whybuy.co.il/message',
        data: {additionalInfo: additional_info}
      })
      .success(function(data, status, headers, config) {
        $scope.conversationInit();
        delete $scope.message_text;
      })
      .error(function(data, status, headers, config) {
      });
  };

  $rootScope.$on('newMessage',function(scope,data){
      console.log('got to newMessage');
      var thread_id = data.CONVERSATION_ID;
      if ($state.params.threadId == thread_id){
          $scope.conversationInit();
      } else {

      };
    });
});

app.run(function($ionicPlatform,$rootScope,$http,$websocket,$state,$ionicPopup,$cordovaNetwork,$ionicPush) {

      $rootScope.logout = function(){
          $http({
            method: 'POST',
            url: 'https://www.whybuy.co.il/logout'
          })
          .success(function(data, status, headers, config) {
            $rootScope.loggedIn=false;
            localStorage.removeItem('user_logged');
            console.log(document.cookie);
            $state.go("login");

          })
          .error(function(data, status, headers, config) {
            $rootScope.showPopup("Error","Failed to logout - please try again");
            //alert("Failed to logout - please try again");
          });
    };
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    };

    if ($cordovaNetwork.isOffline()) {
        $ionicPopup.confirm({
            title: "Internet Disconnected",
            content: "The internet must be connected on your device."
        })
        .then(function(result) {
            ionic.Platform.exitApp();
        });
    };


  });


   $rootScope.max_rentprice=5000;
   $rootScope.max_per_day=1500;
   $rootScope.max_deposit=5000;

  $rootScope.handle_profile_image = function(imageUrl){
      if (!imageUrl){
        return '';
      }
      var image;
      if (imageUrl.indexOf('http') > -1){
        image = imageUrl;
      } else {
        image = 'https://www.whybuy.co.il/'+imageUrl;
      }
      return image;
  }
  $rootScope.showPopup = function(title,message) {
    var alertPopup = $ionicPopup.alert({
      title: title,
      template: message
    });
    alertPopup.then(function(res) {
      console.log('displayed alert'+alert+message);
    });
  };
  $rootScope.send_message = function(message,type,id){
    var additional_info={};
      if (type=='from_item') {
        additional_info ={
          MESSAGE : message,
          ITEM_ID : id
        };
      };
      if (type == 'from_transaction'){
        additional_info ={
          MESSAGE : message,
          TCTX_ID : id
        };
      };
      console.log(additional_info);
      $http({
        withCredentials: true,
        method: 'POST',
        url: 'https://www.whybuy.co.il/message',
        data: {additionalInfo: additional_info}
      })
      .success(function(data, status, headers, config) {
        $rootScope.showPopup("Message sent","Message was sent Successfully");
        //alert("Message was sent Successfully");
      })
      .error(function(data, status, headers, config) {
        $rootScope.showPopup("Error","There was a problem sending message please try again later");
//        alert("There was a problem sending message please try again later");
      });
    };
  if (localStorage.getItem('user_logged')){
      $rootScope.loggedIn=true;
      $http({
          withCredentials: true,
          method: 'POST',
          url: 'https://www.whybuy.co.il/editUserProfile'
        })
        .success(function(data, status, headers, config) {
          //console.log(data);
          $rootScope.profile=data.message;
        });

        // web socket for message and transaction updates

        $rootScope.ws = $websocket.$new({
            url: 'wss://www.whybuy.co.il:443/ws',
            lazy: false,
            reconnect: true,
            reconnectInterval: 5000,
            enqueue: false,
            mock: false
        })
        .$on('$open', function () {
          console.log('connected to websocket');
          $rootScope.$emit('newNotication', 'empty');
        })
        .$on('$message', function (data) {
              console.log(data);
              $rootScope.$emit('newNotication', data);
              if (data.event=='transactionUpdate'){
                if (data.OWNER){
                  $rootScope.$emit('stateChangedForOwner', data);
                };
              };
              if (data.event=='userMessageUpdate'){
                $rootScope.$emit('newMessage', data);
              };
         });
  } else {
      $rootScope.loggedIn=false;
  };
  $rootScope.$emit('newNotication', 'empty');
})
}());
