angular.module('paintApplication')
    .controller('SettingsController', ['$scope','User', function ($scope, User) {

        $scope.errorMessages = {
            required: "This field is required.",
            passwordLength: "The password has to be less than or equal to 10 characters long.",
            passwordMatch: "The passwords do not match"
        }

        $scope.saveSettings =  function(form) {

            var res = User.getContacts()

            setTimeout(function(){
                console.log(res.contacts)
            }, 1000)

            if (form.$valid) {

            } else {
                console.log(false)
            }
        }

    }])