var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    socketio = require('./config/socketio'),
    server,
    https = require('https'),
    fs = require('fs')

// Require express configuration
require('./config/express')(app)

// Require routing
require('./routes')(app)

//mongoose.connect('mongodb://localhost/ChatApplication', function () {

    mongoose.connect('mongodb://jesus:123456@ds037415.mongolab.com:37415/paintapp', function () {

        console.log(arguments)

        // Start listening for requests
    server = app.listen(process.env.PORT || 3000, function () {
        console.log("Listening on port %s", process.env.PORT || 3000)
    })

    var options = {
        key: fs.readFileSync('server/paintApp.key'),
        cert: fs.readFileSync('server/cert.pem')
    }

    https.createServer(options, app).listen(443)

    socketio(server)

})

module.exports = app
