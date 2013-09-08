var TimelogApp = angular.module('timelog', ['ui.bootstrap.zam.calendar']);
// var TimelogApp = angular.module('timelog', ['ui.bootstrap']);
var eventTypeDialog;

TimelogApp.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            controller: CalendarCtrl,
            templateUrl: '/timelog.html'
        })
        .when('/signin', {
            controller: UserCtrl,
            templateUrl: '/signin.html'
        })
        .otherwise({
            redirectTo: '/'
        });
    $locationProvider.html5Mode(true);
});


function CalendarCtrl($scope, $timeout, $dialog) {
    $scope.hours = ['0 am', '1 am', '2 am', '3 am', '4 am', '5 am', '6 am', '7 am', '8 am', '9 am', '10 am', '11 am',
        '12 pm', '1 pm', '2 pm', '3 pm', '4 pm', '5 pm', '6 pm', '7 pm', '8 pm', '9 pm', '10 pm', '11 pm'
    ];
    $scope.total = 12;
    $scope.online = 1;
    $scope.today = new Date();
    var startTime, endTime, status;

    $scope.mouseDown = function(evt) {
        console.log('mouseDown');
        console.log(evt);
        status = 'mouseDown';
    }

    $scope.mouseUp = function(evt) {
        console.log('mouseUp');
        console.log(evt);
    }

    $scope.mouseOver = function(evt) {
        console.log('mouseOver');
        console.log(evt);
    }

    $scope.mouseMove = function(evt) {
        console.log('mouseMove');
        console.log(evt);
    }

    $scope.opts = {
        backdrop: false,
        keyboard: true,
        backdropClick: true,
        templateUrl: '../template/dialog/event-type-modal.html',
        controller: 'EventTypeController'
    };

    $scope.manageType = function() {
        if (eventTypeDialog) eventTypeDialog.close();
        eventTypeDialog = $dialog.dialog($scope.opts);
        eventTypeDialog.open().then(function(result) {});
    }
};

var isEditMode = false;
function EventTypeController($scope, $http, $dialog) {
    // 拿取eventType資料
    $http.get('/get/eventType').success(function(result) {
        $scope.types = result;
    });

    $scope.addEventType = function() {
        var data = { name: $scope.eventType };
        $http.post('/add/eventType', data).success(function(result) {
            if (result == 'Success') {
                 $scope.types.push(data);
            }
        });
    }

    $scope.updateEventType = function(type) {
        var data = { _id: type._id, name: type.name };
        $http.put('/edit/eventType', data).success(function(result) {
            type.editing = false;
        });
    }

    $scope.close = function() {
        eventTypeDialog.close();
    }

    $scope.setEditMode = function(type) {
        type.editing = true;
    }
}