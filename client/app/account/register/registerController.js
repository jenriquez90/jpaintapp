angular.module('paintApplication')
    .controller('RegisterController', ['$scope', 'Auth', '$state', function ($scope, Auth, $state) {

        $scope.errorMessages = {
            required: "This field is required.",
            nameLength: "The name has to be less than or equal to 10 characters long.",
            passwordLength: "The password has to be less than or equal to 10 characters long.",
            passwordMatch: "The passwords do not match"
        }

        $scope.register = function (form, data) {

            if (form.$valid) {
                Auth.createUser(data)
                    .then(function(){
                        $state.go("paint")
                        console.log("Created User", arguments)
                    })
                    .catch(function(){
                        console.log("Something wrong", arguments)
                    })
            } else {
                Auth.logout()
            }
        }

    }])