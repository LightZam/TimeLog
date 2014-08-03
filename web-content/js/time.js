var TimelogApp = angular.module('timelog', ['ui.bootstrap.zam.calendar']);
// var TimelogApp = angular.module('timelog', ['ui.bootstrap']);
var timelogModal; // 改成全域使用，防止一個視窗出現兩個Modal

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

function TopbarCtrl($scope, $timeout, $dialog) {
    $scope.opts = {
        backdrop: false,
        keyboard: true,
        backdropClick: true,
        templateUrl: '../template/dialog/menu.html',
        controller: 'MenuController'
    };

    $scope.showMunu = function() {
        if (timelogModal) timelogModal.close();
        timelogModal = $dialog.dialog($scope.opts);
        timelogModal.open().then(function(result) {});
    }
}

function MenuController($scope, $http, $dialog) {

}

function CalendarCtrl($scope, $timeout, $dialog) {
    $scope.total = 12;
    $scope.online = 1;
    $scope.today = new Date();

    $scope.opts = {
        backdrop: false,
        keyboard: true,
        backdropClick: true,
        templateUrl: '../template/dialog/event-type-modal.html',
        controller: 'EventTypeController'
    };
    
    $scope.manageType = function() {
        if (timelogModal) timelogModal.close();
        timelogModal = $dialog.dialog($scope.opts);
        timelogModal.open().then(function(result) {});
    }    
}

function EventTypeController($scope, $http, $dialog) {
    // 拿取eventType資料
    $http.get('/get/eventType').success(function(result) {
        $scope.types = result;
    });

    $scope.addEventType = function() {
        var data = {
            name: $scope.eventType
        };
        $http.post('/add/eventType', data).success(function(result) {
            if (result == 'Success') {
                $scope.types.push(data);
            }
        });
    }

    $scope.updateEventType = function(type) {
        var data = {
            _id: type._id,
            name: type.name
        };
        $http.put('/edit/eventType', data).success(function(result) {
            type.editing = false;
        });
    }

    $scope.close = function() {
        timelogModal.close();
    }

    $scope.setEditMode = function(type) {
        type.editing = true;
    }
}