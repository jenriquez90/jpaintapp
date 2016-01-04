angular.module('paintApplication')
    .factory('Auth', ['$http', '$q', '$cookieStore', 'User', function ($http, $q, $cookieStore, User) {

        var currentUser = {}
        var roles = ['guest', 'user', 'admin']

        if ($cookieStore.get('token')) {
            currentUser = User.get()
        }

        var auth = {

            login: function (user, callback) {

                var cb = callback || angular.noop,
                    deferred = $q.defer()

                $http.post('/auth/local', {username: user.username, password: user.password})
                    .success(function (data) {
                        $cookieStore.put('token', data.token)

                        currentUser = User.get()
                        deferred.resolve(data)
                        return cb()
                    })
                    .error(function (error) {

                        auth.logout()
                        deferred.reject(error)
                        return (cb(error))
                    })

                return deferred.promise

            },

            logout: function () {
                currentUser = {}
                $cookieStore.remove('token')
            },

            getCurrentUser: function () {
                return currentUser
            },

            hasRole: function (role) {
                if (currentUser.role && role && angular.isArray(roles)) {
                    for (var i = 0; i < roles.length; i++) {
                        if (currentUser.role === roles[i]) {
                            return true
                        }
                    }
                }
                return false

            },

            createUser: function (user, callback) {

                var cb = callback || angular.noop

                return User.save(user,
                    function (data) {
                        $cookieStore.put('token', data.token)
                        currentUser = User.get()

                        return cb(user)
                    },
                    function (error) {

                        auth.logout()
                        return cb(error)

                    }).$promise

            },

            isAuthenticated: function () {
                return currentUser.hasOwnProperty('username')
            }
            ,
            isLoggedInAsync: function (cb) {
                if (currentUser.hasOwnProperty('$promise')) {
                    currentUser.$promise.then(function () {
                        cb(true)
                    }).catch(function () {
                        cb(false)
                    })
                } else if (currentUser.hasOwnProperty('username')) {
                    cb(true)
                } else {
                    cb(false)
                }
            }

        }

        return auth

    }])