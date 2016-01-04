var router = require('express').Router(),
     controller = require('./user.controller'),
     config = require('../../config/environment'),
     auth = require('../../auth/auth.service')

// auth.hasRole(role) checks for role privileges

// Get list of users
router.get('/', auth.hasRole('admin'), controller.index)

// Delete a user by id
router.delete('/:id', auth.hasRole('admin'), controller.destroy)

// Gets user from from jwt. Returns session user.
router.get('/me', auth.isAuthenticated(), controller.me)

// Gets user from from jwt. Returns session user.
router.get('/me/membersInfo', auth.isAuthenticated(), controller.membersInfo)

// Gets list of contacts
router.get('/:id/contacts', auth.isAuthenticated(), controller.getContacts)

// Send friend request
router.post('/:id/friendRequest', auth.isAuthenticated(), controller.friendRequest)

// Confirm friend
router.post('/:id/confirmFriend', auth.isAuthenticated(), controller.confirmFriend)

// Searches for contacts
router.get('/:id/search', auth.isAuthenticated(), controller.searchContacts)

// Changes user password
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword)

// Gets user data by id. ID 'me' is reserved.
router.get('/:id', auth.isAuthenticated(), controller.show)

// handles POST request to create users.
router.post('/', controller.create)

module.exports = router
