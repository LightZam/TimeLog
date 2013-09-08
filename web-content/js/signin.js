function UserCtrl($scope, $http, $location, $log) {
	$scope.signinMode = true;

    $scope.signup = function() {
        if ($scope.signinMode) {
            $scope.signinMode = false;
        } else {
            $http.post('/signup', $scope.user).success(function(result) {
                $scope.user = '';
                $scope.signupForm = {};
                $scope.error = result;
                if (result == 'Success') {
                    window.location.href = '/';  
                }
            });
        }
    }

     $scope.signin = function() {
        if ($scope.signinMode) {
            $http.post('/signin',  $scope.user).success(function(result) {
                $scope.user = '';
                $scope.signinForm = {};
                    $scope.error = result;
                if (result == 'Success') {
                    window.location.href = '/';
                }
            });            
        } else {
            $scope.signinMode = true;
        }
    }
}