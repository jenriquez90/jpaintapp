angular.module('paintApplication')
.config(['$stateProvider', function($stateProvider){

        $stateProvider.state('main',{
            url: '/',
            templateUrl: 'app/main/main.html',
            controller: 'MainController'
        })

    }])