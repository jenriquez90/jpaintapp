angular.module('paintApplication')
.config(['$stateProvider',  function($stateProvider){

        $stateProvider.state('paint',{
            url: '/paint',
            templateUrl: 'app/paint/paint.html',
            controller: 'PaintController',
            authenticate: true
        })

    }])