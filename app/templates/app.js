
angular.module('<%= appId %>', [
    'ionic',
    'ngCordova',
    'angularImBase',
    'ionicImHD',

    '<%= appId %>.controllers',
    '<%= appId %>.directives',
    '<%= appId %>.services',
    '<%= appId %>.utility'
])

.run(['InitService', function (InitService) {
    ionic.Platform.isFullScreen = true;
}])

.config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider',
    function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'tpls/home.html',
                resolve: {
                    'loading': ['InitService', function (InitService) {
                        return InitService;
                    }]
                }
            });

        $urlRouterProvider.otherwise('/home');

        $ionicConfigProvider.platform.android.scrolling.jsScrolling(true);
        $ionicConfigProvider.platform.android.navBar.alignTitle('center');
        $ionicConfigProvider.platform.android.backButton.previousTitleText(false);
        $ionicConfigProvider.platform.android.backButton.icon('ion-ios-arrow-back');
        $ionicConfigProvider.platform.android.spinner.icon('ios');
        $ionicConfigProvider.platform.android.views.swipeBackEnabled(true);
        $ionicConfigProvider.platform.android.views.swipeBackHitWidth(45);
        $ionicConfigProvider.platform.android.tabs.style('standard');
        $ionicConfigProvider.platform.android.tabs.position('bottom');
        $ionicConfigProvider.platform.android.form.toggle('large');

        $ionicConfigProvider.platform.default.backButton.previousTitleText(false);
        $ionicConfigProvider.platform.default.backButton.text(false);
    }
]);

(function () {
    if (typeof summer === 'undefined') {
        angular.element(document).ready(onReady);
    } else {
        summer.on('ready', onReady);
    }

    function onReady () {
        var cfg = {
            mainAppId: '<%= mainAppId %>',
            appId: '<%= appId %>',
        };
        u9.init(cfg);
        angular.bootstrap(document, ['<%= appId %>']);
    }
})();
