angular.module('paintApplication')
    .controller('NavbarController', ['$scope', '$location', 'Auth', '$rootScope', 'socket', 'SimpleToast',
        function ($scope, $location, Auth, $rootScope, socket, SimpleToast) {

            $scope.mainMenu = [
                {
                    name: 'Home',
                    link: '/'
                },
                {
                    name: 'Paint',
                    link: '/paint'
                }]

            /*$scope.$on('friend request sent', function (event, data) {
             socket.emit('friend request sent', data)
             })*/

            $scope.$on('friend request', function (event, data) {

                var message = ""

                console.log(data)

                switch (data.type) {
                    case "sent":
                        message = 'Friend request sent to ' + data.username
                        break
                    case "received":
                        if (data.confirmed) {
                            message = data.username + ' has accepted you as their friend.'
                        } else {
                            message = data.username + ' has sent you a friend request.'
                        }
                        break
                    default:
                        return
                        break
                }

                SimpleToast.show(message)
            })

            $scope.clickHandler = function (url) {
                $location.path(url)
            }

            $scope.isActive = function (path) {
                return path === $location.path()
            }

            $scope.isLoggedIn = function () {
                return Auth.isAuthenticated()
            }

            $scope.getCurrentUser = function () {
                return Auth.getCurrentUser()
            }


            $scope.isAdmin = function () {
                return Auth.hasRole('admin')
            }

            $scope.logout = function () {
                $rootScope.$broadcast("log out")
                socket.emit("cNotification", {type: "loggedOut"})
                Auth.logout()
                $location.path('/')
            }

        }])
    .factory('SimpleToast', ['$mdToast', function ($mdToast) {
        return {
            show: function (message) {
                $mdToast.show(
                    $mdToast.simple()
                        .content(message)
                        .position('top right')
                        .hideDelay(5000)
                )
            }
        }
    }])