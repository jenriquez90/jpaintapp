var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto')

var UserSchema = new Schema({
    username: {
        type: String,
        lowercase: true
    },
    //email: {type: String, lowercase: true},
    role: {
        type: String,
        default: 'user'
    },
    hashedPassword: String,
    provider: String,
    salt: String,
    contacts: [{type: Schema.Types.ObjectId, ref: 'User'}],
    requestsSent: [{type: Schema.Types.ObjectId, ref: 'User'}],
    requestsReceived: [{type: Schema.Types.ObjectId, ref: 'User'}],
    img: {
        type: String,
        default: this.username
    }
})

/**
 * Virtuals
 */
UserSchema
    .virtual('password')
    .set(function (password) {
        this._password = password
        this.salt = this.makeSalt()
        this.hashedPassword = this.encryptPassword(password)
    })
    .get(function () {
        return this._password
    })

// Public profile information
UserSchema
    .virtual('profile')
    .get(function () {
        return {
            'username': this.username,
            'role': this.role
        }
    })

// Non-sensitive info we'll be putting in the token
UserSchema
    .virtual('token')
    .get(function () {
        return {
            '_id': this._id,
            'role': this.role
        }
    })

/**
 * Validations
 */

// Validate empty username
UserSchema
    .path('username')
    .validate(function (username) {
        return username.length
    }, 'Username cannot be blank')

// Validate empty password
UserSchema
    .path('hashedPassword')
    .validate(function (hashedPassword) {
        return hashedPassword.length
    }, 'Password cannot be blank')

// Validate username is not taken
UserSchema
    .path('username')
    .validate(function (value, respond) {
        var self = this;
        this.constructor.findOne({username: value}, function (err, user) {
            if (err) throw err
            if (user) {
                if (self.id === user.id) return respond(true)
                return respond(false)
            }
            respond(true)
        })
    }, 'The specified username is already in use.')


var validatePresenceOf = function (value) {
    return value && value.length
}

/**
 * Pre-save hook
 */
UserSchema
    .pre('save', function (next) {
        if (!this.isNew) return next()

        if (!validatePresenceOf(this.hashedPassword))
            return next(new Error('Invalid password'))
        else
            return next()
    })

/**
 * Methods
 */
UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashedPassword
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function () {
        return crypto.randomBytes(16).toString('base64')
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: function (password) {
        if (!password || !this.salt) return '';
        var salt = new Buffer(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64')
    }
}

module.exports = mongoose.model('User', UserSchema)