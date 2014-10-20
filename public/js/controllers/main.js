app.controller('mainController',['$scope', function($scope) {

  /*
   environment of the app, should be 'staging' when testing,
   otherwise can be set to 'production'
  */
  $scope.environment = "staging";

  // make sure the game ID matches your game ID
  $scope.game_id = "tutorial_app";

  $scope.todos = [];
  $scope.input = {
    data: null,
    priority: null
  };

  /*
    Some dummy players to use in staging environment.
    Create these players in the simulator when you simulate the game.
  */
  var dummies = ['jane_doe','john_doe','jannine_doe'];
  $scope.dummies = {};
  $scope.dummies.list = dummies;
  $scope.dummies.current = dummies[0];


  /*
    Helper function, adds player_id to the query parameter
    when in staging environment
  */
  var buildRoute = function(route){
    if(arguments.length > 1){
      var args = Array.prototype.slice.call(arguments, 0);
      var req_query = args.slice(1,arguments.length).join("&");
    }
    if($scope.environment === "staging"){
      if(req_query)
        return route+"?player_id="+$scope.dummies.current+"&"+req_query;
      else
        return route+"?player_id="+$scope.dummies.current;
    }else{
      if(req_query)
        return route+"?"+req_query
      else
        return route;
    }
  };

  /*
    Function to refresh player data.
    It fetches the player profile, his todo list and opens notification stream.
  */
  var refreshPlayer = function(){
    var access_token = client.getAccessToken();
    // fetch player data
    client.api(buildRoute('/player'),'GET', function(data){
      $scope.$apply(function(){
        $scope.player = data;
        $scope.player_activity = [];
        // get player profile image
        if($scope.environment!=="staging"){
          $scope.player.avatar = "https://api.playlyfe.com/v1/assets/players/" + data.id + "?size=small&access_token=" + access_token;
        }else{
          $scope.player.avatar = "https://playlyfe.com/images/platform/defaults/default-user.png";
        };
        // load todos
        $scope.loadTodos();
        // get auth token for notification stream
        client.api(buildRoute("/notifications/token"),"GET", function(data){
          // open notification stream
          Playlyfe.openNotificationStream($scope.environment, $scope.game_id, $scope.player.id, data.token, function(message){
            $scope.$apply(function(){
              $scope.player_activity.unshift(message);
            });
          });
        });
      });
    });
  };

  $scope.loadTodos = function(){
    var todos = window.localStorage.getItem($scope.player.id);
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
    window.localStorage.setItem($scope.player.id, JSON.stringify($scope.todos));
  };

  $scope.finishTodo = function(todo){
    $scope.deleteTodo(todo);
    $scope.saveTodos();
    client.api(buildRoute('/action/play'),'POST',{id:todo.priority}, function(data){
      client.api(buildRoute('/player'),'GET', function(data){
        $scope.$apply(function(){
          $scope.player = data;
        });
      });
    });
  };

  $scope.changeDummy = function(dummy_id){
    if($scope.dummies.current!==dummy_id){
      $scope.dummies.current = dummy_id;
      refreshPlayer();
    }
  };

  $scope.orderFunction = function(score){
    switch(score.metric.type){
      case 'metric':
        return 3;
      case 'set':
        return 2;
      case 'state':
        return 1;
      default:
        return 0;
    }
  };

  $scope.login = function() {
    client.login();
  };

  $scope.logout = function(){
    client.logout(function(){
      $scope.$apply(function(){
        $scope.logged_in = false;
      });
    });
  };

  if (Playlyfe.getStatus().msg !== 'authenticated') {
    $scope.logged_in = false;
  }else{
    $scope.logged_in = true;
    refreshPlayer();
  }

}]);
