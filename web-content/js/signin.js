function UserCtrl($scope, $http) {
	$scope.signinMode = true;

    $scope.signup = function() {
        $http.post('/create', $scope.user).success(function(data) {
            $scope.todos.push(data);
            $scope.user = '';
            $scope.signupForm = {};
        });
		$scope.signinMode = false;
    }

     $scope.signin = function() {
		$scope.signinMode = true;
        // $post('/create', );
    }
}