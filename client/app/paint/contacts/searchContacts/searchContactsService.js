angular.module('paintApplication')
    .factory('SearchContactsDialog',
        ['$mdDialog', '$mdMedia', 'User', '$rootScope',
            function ($mdDialog, $mdMedia, User, $rootScope) {

                var selectedContacts = []

                function showDialog(ev) {
                    $mdDialog.show({
                        controller: SearchContactsController,
                        templateUrl: 'app/paint/contacts/searchContacts/searchContacts.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true,
                        fullscreen: $mdMedia('sm')// && $scope.customFullscreen
                    })

                }

                function SearchContactsController($scope) {
                    $scope.cancel = function () {
                        $mdDialog.cancel()
                    }
                    $scope.done = function (ev) {
                        $mdDialog.hide()
                    }

                    $scope.search = function (form) {

                        $scope.errorMessage = $scope.foundMatches = null

                        if (form.$valid) {
                            User.find({val: $scope.user}).$promise.then(function (data) {
                                $scope.foundMatches = data.matches
                            }, function (error) {
                                $scope.errorMessage = error.data
                            })
                        } else {
                            form.$setDirty()
                        }
                    }

                    $scope.sendFriendRequest = function (contact) {

                        $scope.errorMessage = null

                        User.friendRequest({contact: contact._id}).$promise.then(function (data) {

                            $rootScope.$broadcast('friend request', {
                                _id: data._id,
                                username: data.username,
                                type: 'sent'
                            })

                        }, function (error) {
                            $scope.errorMessage = error.data
                        })

                    }

                    $scope.viewProfile = function (selected) {
                        console.log(selected)
                    }

                }

                return {
                    contacts: selectedContacts,
                    show: showDialog
                }

            }])