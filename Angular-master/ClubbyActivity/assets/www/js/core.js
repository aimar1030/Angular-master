// ons.disableAutoStatusBarFill(); - Disable the status bar margin.

var server = "http://nikita.clubby.cl/";

var tokenUrl = server + "api/token";

var app = angular.module('app', ['onsen', 'angular-carousel', /*'ngMap',*/ 'LocalStorageModule', 'ngAnimate']);

app.config(['$httpProvider', function ($httpProvider) {
        delete $httpProvider.defaults.headers.common["X-Requested-With"]
    }]);

app.directive('datePicker', function () {
    return {
        link: function postLink(scope, element, attrs) {
            scope.$watch(attrs.datePicker, function () {
                if (attrs.datePicker === 'start') {
                    //element.pickadate();
                }
            });
        }
    };
});

app.controller('dialogController', function ($scope) {
    $scope.show = function (dlg) {
        ons.createDialog(dlg).then(function (dialog) {
            dialog.show();
        });
    }
});

app.controller('pluginsController', function ($scope, $compile) {

    $scope.openWebsite = function () {
        var ref = window.open('http://google.com', '_blank', 'location=yes');
    }

    $scope.openSocialSharing = function () {

        window.plugins.socialsharing.share('Message, image and link', null, 'https://www.google.com/images/srpr/logo4w.png', 'http://www.google.com');

        /*
         * 	Social Sharing Examples
         * 	For more examples check the documentation: https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin
         
         window.plugins.socialsharing.share('Message only')
         window.plugins.socialsharing.share('Message and subject', 'The subject')
         window.plugins.socialsharing.share(null, null, null, 'http://www.google.com')
         window.plugins.socialsharing.share('Message and link', null, null, 'http://www.google.com')
         window.plugins.socialsharing.share(null, null, 'https://www.google.com/images/srpr/logo4w.png', null)
         window.plugins.socialsharing.share('Message and image', null, 'https://www.google.com/images/srpr/logo4w.png', null)
         window.plugins.socialsharing.share('Message, image and link', null, 'https://www.google.com/images/srpr/logo4w.png', 'http://www.google.com')
         window.plugins.socialsharing.share('Message, subject, image and link', 'The subject', 'https://www.google.com/images/srpr/logo4w.png', 'http://www.google.com')
         *
         */
    }

    $scope.openEmailClient = function () {
        ons.ready(function () {
            alert("ons.ready");
            cordova.plugins.email.open({
                to: 'han@solo.com',
                subject: 'Hey!',
                body: 'May the <strong>force</strong> be with you',
                isHtml: true
            });
        });
    }

    $scope.getDirectionsApple = function () {
        window.location.href = "maps://maps.apple.com/?q=37.774929,-122.419416";
    }

    $scope.getDirectionsGoogle = function () {
        var ref = window.open('http://maps.google.com/maps?q=37.774929,-122.419416', '_system', 'location=yes');
    }

    $scope.getDate = function () {
        var options = {
            date: new Date(),
            mode: 'date'
        };
        datePicker.show(options, function (date) {
            alert("date result " + date);
        });
    }
});


app.controller("barcodeScanner", function ($scope) {
    $scope.scan = function () {
        cordova.plugins.barcodeScanner.scan(
                function (result) {
                },
                function (error) {
                }
        );
    }

});

function scanBarCode() {
    alert(1);
    cordova.plugins.barcodeScanner.scan(
            function (result) {
                alert("We got a barcode\n" + "Result: " + result.text);
            },
            function (error) {
                alert("Scanning failed: " + error);
            }
    );
}


document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady()
{
    print_log("onDeviceReady");
    //alert("------deviceready----------");
    gDatabase = window.openDatabase("wvmclubbyDB", "1.0", "clubbyDB", 200000);    
    initDatabase();
    // registerPushwooshAndroid();
    //checkLoggedin();
}