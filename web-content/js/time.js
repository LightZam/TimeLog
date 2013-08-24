angular.module('timelog', ['ui.bootstrap']);
function TodoCtrl($scope, $http) {
    $scope.todos = [
        {text:'learn angular', done:true},
        {text:'build an angular app', done:false}];
 
    $scope.addTodo = function() {
        $scope.todos.push({text:$scope.todoText, done:false});
        $scope.todoText = '';
        $scope.form = {};
        $http.post('/create', {name : 'Zam', password : 123})
        .success(function(data) {
            $location.path('/');
            console.log('create');
        });
    };
 
    $scope.remaining = function() {
        var count = 0;
        angular.forEach($scope.todos, function(todo) {
            count += todo.done ? 0 : 1;
        });
        return count;
    };
 
    $scope.archive = function() {
        $http.get('/read')
        .success(function(data) {
            $location.path('/');
            console.log('read');
        });
    };
}

function CalendarCtrl($scope, $timeout) {
  // $scope.today = function() {
  //   $scope.dt = new Date();
  // };
  // $scope.today();

  // $scope.showWeeks = true;
  // $scope.toggleWeeks = function () {
  //   $scope.showWeeks = ! $scope.showWeeks;
  // };

  // $scope.clear = function () {
  //   $scope.dt = null;
  // };

  // // Disable weekend selection
  // $scope.disabled = function(date, mode) {
  //   return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  // };

  // $scope.toggleMin = function() {
  //   $scope.minDate = ( $scope.minDate ) ? null : new Date();
  // };
  // $scope.toggleMin();

  // $scope.open = function() {
  //   $timeout(function() {
  //     $scope.opened = true;
  //   });
  // };

  // $scope.dateOptions = {
  //   'year-format': "'yy'",
  //   'starting-day': 1
  // };
};

var ModalDemoCtrl = function ($scope) {

  $scope.open = function () {
    $scope.shouldBeOpen = true;
  };

  $scope.close = function () {
    $scope.closeMsg = 'I was closed at: ' + new Date();
    $scope.shouldBeOpen = false;
  };

  $scope.items = ['item1', 'item2'];

  $scope.opts = {
    backdropFade: true,
    dialogFade:true
  };

};