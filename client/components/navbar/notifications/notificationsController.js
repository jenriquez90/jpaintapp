angular.module('paintApplication')
    .controller("NotificationsController",
        ['$scope', 'User', 'NotificationManager', 'SimpleToast',
            function ($scope, User, NotificationManager, SimpleToast) {

                $scope.$on('friend request received', function (event, data) {
                    NotificationManager.addNotification(data)
                    SimpleToast.show("Friend request received!")
                })

                $scope.$on('logged in', function (event, data) {
                    NotificationManager.getNotifications(function () {
                        $scope.notifications = NotificationManager.notifications
                    })
                })

                $scope.openMenu = function ($mdOpenMenu, ev) {
                    $mdOpenMenu(ev)
                }

            }])