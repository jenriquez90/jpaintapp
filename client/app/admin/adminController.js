angular.module('paintApplication')
    .controller('AdminController', function ($scope, $http, Auth, User) {

        $scope.users = User.query()

    })
