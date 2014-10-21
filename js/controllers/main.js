app.controller('mainController',['$scope', function($scope) {

  /*
   environment of the app, should be 'staging' when testing,
   otherwise can be set to 'production'
  */
  $scope.environment = "staging";

  // design variables
  // make sure these match your game variables
  $scope.game_id = "tutorial_app";
  var player_leaderboard_id = "overall_player_leaderboard";
  var team_leaderboard_id = "team_leaderboard";
  var team_definition_id = "sample_team";

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
        $scope.options = {};
        $scope.options.tab = 1;
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
              console.log(message);
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

  $scope.showProfile = function(){
    $scope.options.tab = 1;
  };

  $scope.showPlayerLeaderboard = function(){
    $scope.options.tab = 3;
    // get updated leaderboard data
    client.api(buildRoute('/leaderboards/'+player_leaderboard_id,'cycle=alltime'), 'GET', function(leaderboard){
      $scope.$apply(function(){
        $scope.player_lb = leaderboard.data;
      });
    });
  };


  $scope.showTeams = function(){
    $scope.options.tab = 2;
    // if the player isn't a part of any team, show the list of available teams that he can join
    if($scope.player.teams.length === 0){
      // get all the current teams
      client.api(buildRoute('/teams'),'GET', function(teams){
        $scope.$apply(function(){
          $scope.team_list = teams.data;
        });
      });
    }else{
      // if the player is part of a team
      player_team = $scope.player.teams[0];
      $scope.player_team = player_team;
      // get the list of all members in the team
      client.api(buildRoute('/teams/'+player_team.id+'/members'), 'GET', function(members){
        $scope.$apply(function(){
          console.log("members ",members);
          $scope.player_team.members = members.data;
        });
      });
      // get the name of the team
      client.api(buildRoute('/teams/'+player_team.id),'GET',function(team){
        $scope.$apply(function(){
          $scope.player_team.name = team.name;
        });
      });
    }
  };

  $scope.createTeam = function(new_team_name){
    // create a team
    client.api(buildRoute('/definitions/teams/'+team_definition_id),'POST',{
      'name': new_team_name,
      'access': 'PUBLIC'
    },
    function(team){
      client.api(buildRoute('/player'),'GET', function(data){
        $scope.$apply(function(){
          $scope.player = data;
          $scope.showTeams();
        });
      });
    });
  };

  $scope.joinTeam = function(team){
    // join the team with the role "Junior"
    client.api(buildRoute("/teams/"+team.id+"/join"),"POST",{"Junior": true},function(data){
      client.api(buildRoute('/player'),'GET', function(data){
        $scope.$apply(function(){
          $scope.player = data;
          $scope.showTeams();
        });
      });
    });
  };

  $scope.leaveTeam = function(team){
    client.api(buildRoute('/teams/'+team.id+'/leave'),"POST", function(data){
      $scope.player.teams=[];
    });
  };

  $scope.deleteTeam = function(team){
    client.api(buildRoute('/teams/'+team.id),"DELETE",function(data){
      $scope.player.teams=[];
      $scope.showTeams();
    });
  };

  $scope.showTeamLeaderboard = function(){
    $scope.options.tab = 4;
    client.api(buildRoute('/leaderboards/'+team_leaderboard_id,'cycle=alltime'), 'GET', function(leaderboard){
      $scope.$apply(function(){
        $scope.team_lb = leaderboard.data;
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
