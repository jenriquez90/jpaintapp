angular.module('paintApplication')
    .controller('LoginController', ['$scope', '$location', 'Auth', '$state', '$rootScope',
        function ($scope, $location, Auth, $state, $rootScope) {

        $scope.login = function (form, data) {

            $scope.loginError = null

            if (form.$valid) {

                Auth.login(data)
                    .then(function () {
                        $state.go('paint')
                        $rootScope.$broadcast('logged in')
                    })
                    .catch(function (error) {
                        $scope.loginError = error.message || error
                    })

            }
        }

    }])