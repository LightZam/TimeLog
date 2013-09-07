var TimelogApp = angular.module('timelog', ['ui.bootstrap.zam.calendar']);

TimelogApp.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', { controller: CalendarCtrl, templateUrl: '/timelog.html' }) 
        .when('/signin', { controller: UserCtrl, templateUrl: '/signin.html' })
        .otherwise({redirectTo: '/'});
    $locationProvider.html5Mode(true);
});


function CalendarCtrl($scope, $timeout) {
    $scope.hours = ['0 am', '1 am', '2 am', '3 am', '4 am', '5 am', '6 am', '7 am', '8 am', '9 am', '10 am', '11 am',
                    '12 pm', '1 pm', '2 pm', '3 pm', '4 pm', '5 pm', '6 pm', '7 pm', '8 pm', '9 pm', '10 pm', '11 pm'];
    console.log($scope.dt);
};




