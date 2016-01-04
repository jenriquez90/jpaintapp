angular.module('paintApplication')
    .controller('ConversationsController', ['$scope', 'ConvoManager', '$mdDialog', '$mdMedia', 'Auth',
        function ($scope, ConvoManager, $mdDialog, $mdMedia, Auth) {

            $scope.$on('message', function (event, data) {
                console.log('message received')
                ConvoManager.messageReceived(data)
            })

            $scope.$on('update', function (event, conversation) {
                console.log('update received')
                ConvoManager.update(conversation)
            })

            $scope.activeConvos = ConvoManager.convoCollection
            $scope.selectedConvo = 2

            $scope.customFullscreen = $mdMedia('sm')

            $scope.$on('addPanel', function (event, contact) {
                $scope.selectedConvo = ConvoManager.addConversation(contact, $scope.selectedConvo)
            })

            $scope.$on('addContactToConversation', function (event, contact) {
                ConvoManager.addToCurrentChat(contact, $scope.selectedConvo)
            })

            $scope.sentOrReceived = function (message) {

                message.received = (Auth.getCurrentUser()._id === message.from._id)

                return message.received ? "messageSent" : "messageReceived"
            }

            $scope.sendMessage = function (form, conversation) {

                if (angular.isObject(conversation) && conversation.newMessage && conversation.newMessage.toString().trim()) {
                    if (!angular.isArray(conversation.messages)) {
                        conversation.messages = []
                    }

                    var message = {
                        roomId: conversation.roomId,
                        message: conversation.newMessage,
                        from: {_id: Auth.getCurrentUser()._id, username: Auth.getCurrentUser().username},
                        received: false
                    }

                    ConvoManager.sendMessage(conversation, message)
                    conversation.newMessage = ""
                }
            }

            $scope.endConversation = function (ev, index) {

                var confirm = $mdDialog.confirm()
                    .title('Are you sure?')
                    .content('You will lose all chat history and your drawings.')
                    //.ariaLabel('End conversation?')
                    //.targetEvent(ev)
                    .ok('Yes')
                    .cancel('No')

                $mdDialog.show(confirm).then(function () {

                    if ($scope.activeConvos[index] && $scope.activeConvos[index].memberIds.length > 2) {
                        $scope.$emit('leave room', {roomId: $scope.activeConvos[index].roomId})
                    }

                    $scope.activeConvos.splice(index, 1)
                    $scope.selectedConvo = 0

                })

            }

            $scope.setTitle = function (convo) {
                var title = ""
                if (convo && angular.isArray(convo.members)) {
                    if (convo.members.length > 2) {
                        title += "Group: " + convo.members.length + " members."
                    } else {
                        title += "Private: " + convo.members[0].username
                    }
                }

                return title
            }

            $scope.isLayerActive = function (convo, member) {

                console.log(member)

                return member.visibleLayer

            }

            $scope.toggleLayer = function (convo, member) {
                //if (Auth.getCurrentUser()._id === member._id) {
                  //  member.layerVisible = true
                //} else {
                    member.layerVisible = !member.layerVisible
               // }

            }

            $scope.getCurrentUser = function () {
                return Auth.getCurrentUser()._id
            }

            $scope.isOwnCanvas = function (id) {
                return Auth.getCurrentUser()._id === id
            }

        }])
    .directive("messageView", [function () {

        return {
            restrict: "C",
            scope: {
                messages: "="
            },
            link: function (scope, elem, attrs) {

                var originalHeight = null, parent = elem.parent()

                scope.$watch("messages", function () {

                    var newHeight = parseFloat(window.getComputedStyle(parent[0]).height)

                    if (originalHeight === null) {
                        if (newHeight > 0) {
                            originalHeight = newHeight
                        }
                    }

                    if (newHeight > originalHeight) {
                        parent.css({
                            height: originalHeight + 'px',
                            overflow: 'auto'
                        })
                    }

                    parent[0].scrollTop = parent[0].scrollHeight

                })
            }
        }

    }])