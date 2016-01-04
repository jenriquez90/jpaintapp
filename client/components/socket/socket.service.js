angular.module('paintApplication')
    .factory('socket', ['$rootScope', '$cookieStore', 'Auth', function ($rootScope, $cookieStore, Auth) {

        var socket = null

        return {
            initialize: function (cb) {
                if (socket === null) {

                    socket = io({forceNew: true})
                    console.log(socket)

                    socket.on('connect', function () {

                        console.log("Create socket", socket)

                        socket.on('authenticated', function () {
                        }).emit('authenticate', {token: $cookieStore.get('token')})
                    })

                    cb()

                }
            },
            on: function (event, callback) {
                if (socket) {
                    socket.on(event, function () {
                        var args = arguments
                        $rootScope.$apply(function () {
                            if (callback) {
                                callback.apply(socket, args)
                            }
                        })
                    })
                }
            },
            emit: function (event, data, callback) {

                if (data) {
                    data.from = data.from || {}
                    data.from.username = Auth.getCurrentUser().username

                }

                if (socket) {
                    socket.emit(event, data, function () {
                        var args = arguments
                        $rootScope.$apply(function () {
                            if (callback) {
                                callback.apply(socket, args)
                            }
                        })
                    })
                }
            },
            removeEvent: function (event) {
                if (socket) {
                    socket.removeAllListeners(event)
                }
            },
            disconnect: function () {
                if (socket) {
                    socket.disconnect()
                    socket.destroy()
                }
                socket = null

            }
        }
    }])