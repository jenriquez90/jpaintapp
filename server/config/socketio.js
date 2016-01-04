var socketIO = require('socket.io'),
    config = require('./environment'),
    socketioJwt = require('socketio-jwt'),
    User = require('../api/user/user.model')

module.exports = function (server) {

    var io = socketIO.listen(server),
        rooms = {},
        conversations = {},
        images = {}

    io.sockets.on('connection',
        socketioJwt.authorize({secret: config.secrets.session, timeout: 15000}))
        .on('authenticated', function (socket) {

            var socketId = socket.id, userId = socket.decoded_token._id

            socket.leave(socketId)
            socket.join(userId)

            rooms[userId] = rooms[userId] || []
            rooms[userId].push(socketId)

            function addToRoom(conversation) {

                var memberId, connectedSockets = io.sockets.connected

                if (conversation && conversation.members && Array.isArray(conversation.members)) {

                    if(images[conversation.roomId]) {
                        conversation.image = images[conversation.roomId]
                    }

                    for (var i = 0; i < conversation.members.length; i++) {
                        memberId = conversation.members[i]
                        conversations[conversation.roomId] = conversations[conversation.roomId] || {}
                        conversations[conversation.roomId][memberId] = true

                        for (var j = 0; j < rooms[memberId].length; j++) {
                            if (connectedSockets[rooms[memberId][j]] && connectedSockets[rooms[memberId][j]].join) {
                                connectedSockets[rooms[memberId][j]].join(conversation.roomId)
                                console.log(memberId + " joined room: " + conversation.roomId)
                            }
                        }
                    }

                    conversation.members = conversations[conversation.roomId]
                    conversation.updateType = 'update members'
                    io.sockets.to(conversation.roomId).emit('update', conversation)

                }
            }

            socket.on('add to room', addToRoom)

            socket.on('message', function (conversation) {
                conversation.from = conversation.from || {}
                conversation.from.id = socket.decoded_token._id

                if (conversation.source === "canvas") {
                    images[conversation.roomId] = images[conversation.roomId] || {}
                    images[conversation.roomId][userId] = conversation.message
                    socket.to(conversation.roomId).emit("message", conversation)
                } else {
                    socket.to(conversation.roomId).emit("message", conversation)
                }

            })

            socket.on('leave room', function (room) {
                socket.leave(room.roomId)
                delete conversations[room.roomId][userId]

                var updateInfo = {
                    roomId: room.roomId,
                    updateType: "member left conversation",
                    user: userId
                }

                socket.to(room.roomId).emit("update", updateInfo)

                delete images[room.roomId][userId]

                //io.sockets.connected[rooms[socket.decoded_token._id][0]].leave(room.roomId)
                //io.sockets.connected[socket.decoded_token._id].leave(room.roomId)
            })

            socket.on('friend request', function (request) {

                var requestData = {
                    from: userId,
                    to: request._id,
                    confirmed: request.confirmed || null,
                    type: 'received'
                }

                User.findById(userId, 'username', function (err, doc) {
                    if (doc && doc.username) {

                        requestData.username = doc.username

                        socket.to(requestData.to).emit('friend request', requestData)
                    }
                })

            })

            socket.on('cNotification', function (data) {
                var userId = socket.decoded_token._id

                if (data.type = 'loggedIn') {

                    for (conversation in conversations) {

                        var members = []

                        if (conversations[conversation][userId]) {

                            for (member in conversations[conversation]) {
                                if (conversations[conversation][member]) {
                                    members.push(member)
                                }
                            }

                            addToRoom({
                                roomId: conversation,
                                members: members
                            })

                        }
                    }
                }

                User.findById(userId, '_id username contacts', function (err, doc) {

                    data.from.username = doc.username

                    if (doc && doc.contacts && Array.isArray(doc.contacts)) {
                        for (var i = 0; i < doc.contacts.length; i++) {
                            socket.to(doc.contacts[i]).emit("sNotification", data)
                        }
                    }
                })
            })

            socket.on('disconnect', function () {
                //socket.leave(userId)
                //delete rooms[userId]
                //socket.disconnect()
            })

        })

}