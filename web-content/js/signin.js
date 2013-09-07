function UserCtrl($scope, $http, $location, $log) {
	$scope.signinMode = true;
    // var lastRoute = $route.current;
    // $scope.$on('$locationChangeSuccess', function(event) {
    //     $route.current = lastRoute;
    // });
    // $routeProvider.when("/signin", {templateUrl: 'signin.html'})   
    // .when("/timelog", {templateUrl: 'timelog.html'})   
    // .otherwise({redirectTo: "/"});    
        
    $scope.signup = function() {
        $http.post('/signup', $scope.user).success(function(data) {
            $scope.user = '';
            $scope.signupForm = {};
            console.log(data);
        });
		// $scope.signinMode = false;
    }

     $scope.signin = function() {
		// $scope.signinMode = true;
        $http.post('/signin',  $scope.user).success(function(data) {
            $scope.user = '';
            $scope.signinForm = {};
            // $location.path('timelog.html');
            // $scope.$apply();
            // $scope.error = data;
            // $location.url('');
 
        });
    }
}