
angular.module('<%= appId %>.services')

.factory('InitService', ['$rootScope', '$q', 'Config', '<%= servicePre %>Dialog',
    function($rootScope, $q, Config, <%= servicePre %>Dialog) {
        var defer = $q.defer();

        init();

        return defer.promise;

        function init () {
            $rootScope.$on('responseError', function (e, err) {
                <%= servicePre %>Dialog.toastBottom(err.message);
            });

            var tasks = [Config.loaded];
            $q.all(tasks).finally(function() {
                defer.resolve();
            });
        }
    }
]);
