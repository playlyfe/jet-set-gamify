app.controller('mainController',['$scope', function($scope) {

  $scope.todos = [];
  $scope.input = {
    data: null,
    priority: null
  };

  $scope.loadTodos = function(){
    var todos = window.localStorage.getItem("my_todos");
    if(todos != null){
      $scope.todos = JSON.parse(todos);
    }
  };

  $scope.addTodo = function() {
    $scope.todos.push({
      data: $scope.input.data,
      priority: $scope.input.priority
    });
    $scope.input = {
      data: null,
      priority: null
    };
    $scope.saveTodos();
  };

  $scope.deleteTodo = function(todo){
    var index = $scope.todos.indexOf(todo);
    $scope.todos.splice(index,1);
  };

  $scope.saveTodos = function(){
    window.localStorage.setItem("my_todos", JSON.stringify($scope.todos));
  };

  $scope.finishTodo = function(todo){
    $scope.deleteTodo(todo);
    $scope.saveTodos();
  };

  $scope.loadTodos();

}]);
