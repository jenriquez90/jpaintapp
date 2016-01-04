var path = require('path')

module.exports = function (app) {

    app.use('/api/users', require('./api/user'))
    app.use('/auth', require('./auth'))

    app.get('/*',function (req, res) {
        res.sendFile(path.resolve(app.get('appPath') + '/index.html'))
    })

}