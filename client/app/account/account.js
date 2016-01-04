angular.module('paintApplication')
    .config(['$stateProvider', function ($stateProvider) {

        $stateProvider
            .state('register', {
                url: '/register',
                templateUrl: 'app/account/register/register.html',
                controller: 'RegisterController'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'app/account/login/login.html',
                controller: 'LoginController'
            })
            .state('settings', {
                url: '/settings',
                templateUrl: 'app/account/settings/settings.html',
                controller: 'SettingsController',
                authenticate: true
            })

    }])