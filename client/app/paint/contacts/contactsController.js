angular.module('paintApplication')
    .controller('ContactsController',
        ['$scope', '$mdSidenav', 'User', 'SearchContactsDialog', '$rootScope',
            function ($scope, $mdSidenav, User, SearchContactsDialog, $rootScope) {

                $scope.$on('update contacts', function () {
                    requestUserInfo()
                })

                $scope.close = function () {
                    $mdSidenav('contacts').close()
                }

                $scope.startChat = function (contact) {
                    if (!contact.status)
                        $scope.$emit("newConversation", contact)
                }

                $scope.addToConversation = function (contact) {
                    if (!contact.status)
                        $scope.$emit("addToConversation", contact)
                }

                $scope.getImage = function (name) {
                    return 'assets/img/users/' + name + '.png'
                }

                $scope.showContactsDialog = SearchContactsDialog.show

                $scope.confirmFriend = function (user) {

                    User.confirmFriend({contact: user._id}).$promise.then(function () {

                        $rootScope.$broadcast('friend request', {
                            _id: user._id,
                            username: user.username,
                            confirmed: true,
                            type: 'confirm'
                        })

                        requestUserInfo()
                    }, function () {
                        console.log('error: ', arguments)
                    })

                }

                requestUserInfo()

                function requestUserInfo() {
                    User.get().$promise.then(function (data) {
                        $scope.contacts = data.contacts || []

                        if (angular.isArray(data.requestsSent)) {
                            for (var i = 0; i < data.requestsSent.length; i++) {
                                data.requestsSent[i].status = 'Request Sent'
                                $scope.contacts.push(data.requestsSent[i])
                            }
                        }

                        if (angular.isArray(data.requestsReceived)) {
                            for (var i = 0; i < data.requestsReceived.length; i++) {
                                data.requestsReceived[i].status = 'Confirm Friend'
                                $scope.contacts.push(data.requestsReceived[i])
                            }
                        }

                    })
                }

            }])