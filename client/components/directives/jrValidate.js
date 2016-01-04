angular.module("jrValidate", [])
    .directive("mustEqual", function () {
        return {
            require: "ngModel",
            restrict: "A",
            scope: {
                compareTo: "=mustEqual"
            },
            link: function (scope, elem, attr, ctrl) {

                scope.$watch("compareTo", function () {
                    ctrl.$validate()
                })

                ctrl.$validators.mustEqual = function (modelValue) {
                    return (modelValue === scope.compareTo)
                }
            }
        }
    })