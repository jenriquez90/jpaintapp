var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy

exports.setup = function (User, config) {
    passport.use(new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password'
        },
        function (user, password, done) {
            User.findOne({
                username: user.toLowerCase()
            }, function (err, user) {
                if (err) return done(err)

                if (!user || (user && !user.authenticate(password))) {
                    return done(null, false, {message: 'Invalid credentials.'})
                }

                return done(null, user)
            })
        }
    ))
}