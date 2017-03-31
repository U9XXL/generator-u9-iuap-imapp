
angular.module('<%= appId %>.services')

.factory('InitService', ['$rootScope', '$q', 'Config', 'imanDialog',
    function($rootScope, $q, Config, imanDialog) {
        var defer = $q.defer();

        init();

        return defer.promise;

        function init () {
            $rootScope.$on('responseError', function (e, err) {
                imanDialog.toastBottom(err.message);
            });

            var tasks = [Config.loaded];
            $q.all(tasks).finally(function() {
                defer.resolve();
            });
        }
    }
]);
