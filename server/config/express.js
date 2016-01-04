var express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    passport = require('passport')

// Express configuration
module.exports = function (app) {
    app.set('appPath', (path.normalize('client')))

    app.use(bodyParser.urlencoded({extended: false}))
    app.use(bodyParser.json())
    app.use(express.static(app.get('appPath')))
    app.use(passport.initialize())

    console.log('Path: ', app.get('appPath'))
}