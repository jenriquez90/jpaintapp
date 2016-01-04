var User = require('./user.model'),
    passport = require('passport'),
    config = require('../../config/environment'),
    jwt = require('jsonwebtoken'),
    ObjectID = require('mongoose').Types.ObjectId

var validationError = function (res, err) {
    return res.status(422).json(err)
}

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function (req, res) {
    User.find({}, '_id username', function (err, users) {
        if (err) return res.status(500).send(err)
        res.status(200).json(users)
    })
}

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
    var newUser = new User(req.body)

    newUser.provider = 'local'
    newUser.role = 'user'
    newUser.save(function (err, user) {
        if (err) return validationError(res, err)

        var token = jwt.sign({_id: user._id}, config.secrets.session, {expiresInMinutes: 60 * 5})
        res.json({token: token})
    })
}

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
    var userId = req.params.id

    User.findById(userId, "_id username", function (err, user) {
        if (err) return next(err)
        if (!user) return res.status(401).send('Unauthorized')
        res.json(user.profile)
    })
}

exports.getContacts = function (req, res, next) {
    if (req.headers.authorization && req.headers.authorization == "Bearer 12345") {
        res.send({contacts: [1, 2, 3]})
    } else {
        res.status(401).end()
    }
}

exports.searchContacts = function (req, res, next) {

    var val = new RegExp(req.query.val, "ig"),
        userId = req.user._id

    User.find({"username": {"$regex": val}, "_id": {"$ne": userId}},
        "_id username",
        function (error, docs) {

            if (!error && docs && docs.length > 0) {
                res.send({matches: docs})
            } else {
                res.status(404).send({message: "No matches found"})
            }

        }
    )

}

exports.membersInfo = function (req, res, next) {

    console.log(req.query.memberIds)

    User.find({"_id": {"$in": req.query.memberIds}}, "_id username img", function (error, docs) {

        if (!error && docs && docs.length > 0) {
            res.send({members: docs})
        } else {
            res.status(404).send({message: "No matches found"})
        }

    })

}

/**
 * Add friend to current user
 */
exports.confirmFriend = function (req, res, next) {
    var userId = req.user._id
        , newContactID = String(req.body.contact)

    User.findById(newContactID, "_id username", function (err, newContact) {

        if (err) return validationError(res, err)

        User.update({_id: userId},
            {$addToSet: {contacts: newContact._id}, $pull: {requestsReceived: newContact._id}},
            function (err, user) {
                if (err) return validationError(res, err)

                User.update({_id: newContact._id},
                    {$addToSet: {contacts: userId}, $pull: {requestsSent: userId}},
                    function (err, doc) {
                        if (err) return validationError(res, err)
                        res.status(200).send(doc)
                    })

            })

    })

}

/**
 * Add friend request
 */
exports.friendRequest = function (req, res, next) {
    var userId = req.user._id
        , newContactID = String(req.body.contact)

    User.findById(newContactID, "_id username", function (err, newContact) {

        if (err) return validationError(res, err)

        User.update({_id: newContactID}, {$addToSet: {requestsReceived: userId}}, function () {
            if (err) return validationError(res, err)

            User.update({_id: userId}, {$addToSet: {requestsSent: newContact._id}}, function () {
                if (err) return validationError(res, err)
                res.status(200).send(newContact)
            })

        })

    })

}
/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function (req, res) {
    User.findByIdAndRemove(req.params.id, function (err, user) {
        if (err) return res.status(500).send(err)
        return res.status(204).send('No Content')
    })
}

/**
 * Change a users password
 */
exports.changePassword = function (req, res, next) {
    var userId = req.user._id
        , oldPass = String(req.body.oldPassword)
        , newPass = String(req.body.newPassword)

    User.findById(userId, function (err, user) {
        if (user.authenticate(oldPass)) {
            user.password = newPass
            user.save(function (err) {
                if (err) return validationError(res, err)
                res.status(200).send('OK')
            })
        } else {
            res.status(403).send('Forbidden')
        }
    })
}

/**
 * Get my info
 */
exports.me = function (req, res, next) {
    var userId = req.user._id
    User.findOne({
        _id: userId
    }, '_id username contacts requestsSent requestsReceived').populate({
            path: 'contacts requestsSent requestsReceived',
            select: '_id username img'
        })
        .exec(function (err, user) {
            if (err) return next(err);
            if (!user) return res.status(401).send('Unauthorized')
            res.json(user)
        })
}

/**
 * Authentication callback
 */
exports.authCallback = function (req, res, next) {
    res.redirect('/')
};
