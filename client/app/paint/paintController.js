angular.module('paintApplication')
    .controller('RootController', ['$scope', '$rootScope', 'socket', 'SimpleToast',
        function ($scope, $rootScope, socket, SimpleToast) {

            $scope.$on('logged in', function () {

                socket.initialize(function () {

                    socket.on('friend request', function (data) {
                        $rootScope.$broadcast('friend request', data)
                        $rootScope.$broadcast('update contacts')
                    })

                    socket.on('sNotification', function (data) {

                        var message;

                        switch (data.type) {
                            case "loggedIn":
                                message = data.from.username + " has logged in"
                                break
                            case "loggedOut":
                                message = data.from.username + " has logged out"
                                break
                            default:
                                break
                        }

                        if (message)
                            SimpleToast.show(message)

                    })

                    socket.on('message', function (data) {
                        $rootScope.$broadcast('message', data)
                    })

                    socket.on('update', function (conversation) {
                        $rootScope.$broadcast('update', conversation)
                    })

                    socket.emit('cNotification', {
                        type: "loggedIn"
                    })

                })

            })

            $scope.$on("leave room", function (event, data) {
                socket.emit("leave room", data)
            })

            $scope.$on("log out", function () {

                setTimeout(function () {
                    socket.removeEvent('message')
                    socket.removeEvent('update')
                    socket.removeEvent('sNotification')
                    socket.removeEvent('friend request')
                    //ConvoManager.clearAll()
                    socket.disconnect()
                }, 0)


            })

        }])
    .controller('PaintController',
        ['$scope', '$mdSidenav', '$anchorScroll', 'socket', 'User', '$rootScope',
            function ($scope, $mdSidenav, $anchorScroll, socket, User, $rootScope) {

                $scope.$on("newConversation", function (event, data) {
                    if (event && angular.isFunction(event.stopPropagation)) {
                        event.stopPropagation()
                    }
                    $mdSidenav('contacts').close()
                    $scope.$broadcast("addPanel", data)
                })

                $scope.$on("addToConversation", function (event, data) {
                    if (event && angular.isFunction(event.stopPropagation)) {
                        event.stopPropagation()
                    }
                    $mdSidenav('contacts').close()
                    $scope.$broadcast("addContactToConversation", data)

                })

                $scope.$on("friend request", function (event, data) {
                    socket.emit('friend request', data)
                    $rootScope.$broadcast('update contacts', data)
                })

                $scope.showContacts = function () {
                    $mdSidenav('contacts').open().then(function () {
                        $anchorScroll("top")
                    })
                }

                setTimeout(function () {
                    $scope.showContacts()

                    var btnShowContacts = angular.element(document.getElementById("contacts"))

                    $scope.$watch(function () {
                        return $mdSidenav('contacts') ? $mdSidenav('contacts').isOpen() : false
                    }, function (value) {
                        if (value !== undefined) {
                            if (value) {
                                btnShowContacts.addClass('hide')
                            } else {
                                btnShowContacts.removeClass('hide')
                            }
                        }
                    })

                    $rootScope.$broadcast('logged in')

                }, 250)

            }])
