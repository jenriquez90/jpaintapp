angular.module('paintApplication')
    .factory("NotificationManager", ['User', function ( User) {

        function setFriendRequestTitle(username) {
            return username + " wants to be your friend"
        }

        var NM = {
            notifications: [],
            getNotifications: function (cb) {
                var notification;
                User.get().$promise.then(function (data) {
                    NM.notifications = []

                    if (angular.isArray(data.requestsReceived)) {
                        for (var i = 0; i < data.requestsReceived.length; i++) {
                            notification = {
                                title: setFriendRequestTitle(data.requestsReceived[i].username)
                            }
                            NM.notifications.push(notification)
                        }
                    }

                    cb()

                })
            },
            addNotification: function (data) {
                var notification = {
                    title: setFriendRequestTitle(data.username)
                }
                NM.notifications.push(notification)
            }

        }

        return NM

    }])