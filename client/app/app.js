angular.module('paintApplication',
    ['ui.router', 'ngMaterial', 'ngMessages', 'jrValidate', 'ngResource', 'ngCookies', 'mdColorPicker'])
    .config(['$urlRouterProvider', '$locationProvider', '$mdIconProvider', '$httpProvider', '$mdThemingProvider',
        function ($urlRouterProvider, $locationProvider, $mdIconProvider, $httpProvider, $mdThemingProvider) {

            $urlRouterProvider.otherwise('/')
            $locationProvider.html5Mode(true)

            $mdIconProvider
                .iconSet('communication', 'assets/img/icons/sets/communication-icons.svg', 24)
                .defaultIconSet('assets/img/icons/sets/core-icons.svg', 24)

            $httpProvider.interceptors.push('Auth.Interceptor')

            /*$mdThemingProvider.theme('default')
             .dark();
             */

            $mdThemingProvider.definePalette('customPalette', {
                '50': '66b3ba',
                '100': '5ba1a7',
                '200': 'a3d1d5',
                '300': '93c9ce',
                '400': '84c2c7',
                '500': '62B6CB',
                '600': '62b6cd',
                '700': '71bdd0',
                '800': '58a3b6',
                '900': '4e91a2',
                'A100': 'dff0f4',
                'A200': 'ff5252',
                'A400': 'ff1744',
                'A700': 'd50000',
                'contrastDefaultColor': 'dark',    // whether, by default, text (contrast)
                // on this palette should be dark or light
                'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
                    '200', '300', '400', 'A100'],
                'contrastLightColors': ['50', '100',
                    '200', '300', '400', 'A100']    // could also specify this if default was 'dark'
            });
            $mdThemingProvider.theme('default')
                .primaryPalette('customPalette')


        }])
    .factory('Auth.Interceptor',
        ['$rootScope', '$q', '$cookieStore', '$location',
            function ($rootScope, $q, $cookieStore, $location) {
                return {
                    // Add authorization token to headers
                    request: function (config) {
                        config.headers = config.headers || {}

                        if ($cookieStore.get('token')) {
                            config.headers.Authorization = 'Bearer ' + $cookieStore.get('token')
                        }

                        return config
                    },

                    // Intercept 401s and redirect you to login
                    responseError: function (response) {
                        if (response.status === 401) {
                            $location.path('/login')
                            $cookieStore.remove('token')
                            return $q.reject(response)
                        }
                        else {
                            return $q.reject(response)
                        }
                    }
                }
            }])
    .run(['$rootScope', '$state', 'Auth', function ($rootScope, $state, Auth) {

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            // User is not authenticated

            Auth.isLoggedInAsync(function (loggedIn) {
                if (toState.authenticate && !loggedIn) {
                    event.preventDefault()
                    $state.go("login")
                }

            })

        })

    }])