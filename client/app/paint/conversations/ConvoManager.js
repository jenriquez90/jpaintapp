angular.module('paintApplication')
    .factory("ConvoManager", ['Auth', 'socket', 'User', function (Auth, socket, User) {

        var CM = {
            convoCollection: [],
            addConversation: function (contact, selectedConvo) {
                var createPanel = true, conversations = this.convoCollection, currentUser = Auth.getCurrentUser()

                if (contact._id !== currentUser._id) {

                    for (var i = 0; i < conversations.length; i++) {
                        if ((conversations[i] && conversations[i].type === "PM") &&
                            angular.isArray(conversations[i].members) &&
                            (conversations[i].members.length === 2) &&
                            ((conversations[i].members[0]._id === contact._id)
                            || (conversations[i].members[1]._id === contact._id))) {

                            selectedConvo = i
                            createPanel = false
                            break

                        }
                    }

                    if (createPanel) {

                        var currentUser = Auth.getCurrentUser()

                        var newConversation = {
                            roomId: currentUser._id + Date.now(),
                            title: "PM: " + contact.username,
                            type: "PM",
                            /*members: [{_id: currentUser._id, username: currentUser.username, viewLayer: true},
                             {_id: contact._id, username: contact.username, viewLayer: true}],
                             */memberIds: [currentUser._id, contact._id],
                            messages: [],
                            image: {},
                            visibleLayers: {}
                        }

                        conversations.push(newConversation)

                        socket.emit('add to room', {
                            roomId: newConversation.roomId,
                            members: newConversation.memberIds
                        })

                    }
                }

                return selectedConvo

            },
            addToCurrentChat: function (contact, selectedConvo) {
                var isMember = false, convo = this.convoCollection[selectedConvo]

                for (var i = 0; i < convo.members.length; i++) {
                    if ((convo.members[i]._id === contact._id)) {
                        isMember = true
                        break
                    }
                }

                if (!isMember) {

                    socket.emit('add to room', {
                        roomId: convo.roomId,
                        members: [contact._id]
                    })

                    convo.memberIds.push(contact._id)
                }

            },
            sendMessage: function (conversation, message) {

                conversation.messages.push({
                    roomId: message.roomId,
                    text: message.message,
                    from: message.from
                })

                socket.emit('message', message)

            },
            messageReceived: function (data) {

                var createPanel = true,
                    conversations = this.convoCollection,
                    selectedConvo

                for (var i = 0; i < conversations.length; i++) {
                    if (conversations[i].roomId === data.roomId) {
                        selectedConvo = i
                        createPanel = false
                        break
                    }
                }

                if (createPanel) {

                    var newconversation = {
                        roomId: data.roomId,
                        title: "PM: " + data.from.username,
                        type: "PM",
                        memberIds: data.members,
                        image: data.image || {},
                        messages: [],
                        visibleLayers: {}
                    }

                    if (data.source === 'canvas') {
                        newconversation.image[data.from.id] = data.message
                    } else {
                        newconversation.messages.push({text: data.message, received: true, from: data.from})
                    }

                    conversations.push(newconversation)

                } else {

                    if (data.source === 'canvas') {

                        conversations[selectedConvo].image = conversations[selectedConvo].image || {}
                        conversations[selectedConvo].image[data.from.id] = data.message

                    } else {
                        conversations[selectedConvo].messages.push({
                            text: data.message,
                            received: true,
                            from: data.from
                        })
                    }
                }

            },
            clearAll: function () {
                this.convoCollection = []
            },
            getConversation: function (conversation) {

                var conversations = this.convoCollection

                for (var i = 0; i < conversations.length; i++) {
                    if (conversations[i].roomId === conversation.roomId) {
                        return i
                    }
                }

                this.convoCollection.push({
                    roomId: conversation.roomId,
                    messages: [],
                    memberIds: conversation.members || [],
                    visibleLayers: {}
                })

                return conversations.length - 1

            },
            updateTitle: function (index) {

                var convo = this.convoCollection[index]

                if (convo.members.length > 2) {
                    convo.type = "GP"
                } else {
                    convo.type = "PM"
                }

                convo.title = convo.type + ": " + convo.members.map(function (m) {
                        return " " + m.username
                    })

            },
            update: function (updateInfo) {

                if (updateInfo && updateInfo.updateType) {

                    var iIndex = this.getConversation(updateInfo)
                    if (this.convoCollection[iIndex]) {

                        var conversationUpdated = this.convoCollection[iIndex]

                        switch (updateInfo.updateType) {
                            case 'change title':

                                if (updateInfo.title) {
                                    conversationUpdated.title = updateInfo.title
                                }

                                break

                            case 'member left conversation':

                                conversationUpdated.memberIds.splice(conversationUpdated.memberIds.indexOf(updateInfo.user), 1)

                                for(var i = 0; i < conversationUpdated.members.length; i++){
                                    if(conversationUpdated.members[i]._id === updateInfo.user){
                                        conversationUpdated.members.splice(i, 1)
                                    }
                                }

                                console.log(conversationUpdated)

                                delete conversationUpdated.image[updateInfo.user]
                                delete conversationUpdated.canvasCollection[updateInfo.user]

                                CM.updateTitle(iIndex)

                                break

                            case 'update members':
                                if (updateInfo.members && this.convoCollection[iIndex].memberIds) {

                                    var members = []

                                    for (m in updateInfo.members) {
                                        if (updateInfo.members[m]) {
                                            members.push(m)
                                        }
                                    }

                                    conversationUpdated.memberIds = members
                                    conversationUpdated.image = updateInfo.image

                                    console.log(updateInfo.image)

                                    User.getMembersInfo({memberIds: conversationUpdated.memberIds})
                                        .$promise.then(function (data) {

                                        if (data && data.members && data.members.length) {
                                            for (var i = 0; i < data.members.length; i++) {
                                                data.members[i].layerVisible = true
                                            }
                                        }

                                        conversationUpdated.members = data.members
                                        CM.updateTitle(iIndex)
                                    }, function () {
                                        console.log('error update', arguments)
                                    })

                                }

                                break

                            default:
                                break
                        }
                    }
                }
            },
            sendImage: function (roomId, data) {

                socket.emit('message', {
                    roomId: roomId,
                    message: data,
                    source: 'canvas'
                })

            }
        }

        return CM

    }])