angular.module('paintApplication')
.factory('User', ['$resource', function($resource){

        return $resource('/api/users/:id/:controller', {
            id: "@_id"
        }, {
            get: {
                method: 'GET',
                params: {
                    id: 'me'
                }
            },
            getContacts: {
                method: 'GET',
                params: {
                    id: 'me',
                    controller: 'contacts'
                }
            },
            find: {
                method: 'GET',
                params: {
                    id: 'me',
                    controller: 'search'
                }
            },
            friendRequest: {
                method: 'POST',
                params: {
                    id: 'me',
                    controller: 'friendRequest'
                }
            },
            confirmFriend: {
                method: 'POST',
                params: {
                    id: 'me',
                    controller: 'confirmFriend'
                }
            },
            getMembersInfo:{
                method: 'GET',
                params: {
                    id: 'me',
                    controller: 'membersInfo'
                }
            }
        })

    }])