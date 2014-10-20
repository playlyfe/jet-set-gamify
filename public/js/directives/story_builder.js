app.directive('plStoryBuilder', function(){
  return {
    scope: {
      story: '=plStoryBuilder',
      context: '@plStoryContext',
      profile: '=plProfileData',
      env: '@plEnv'
    },
    replace: false,
    controller: ['$scope', '$rootScope', function($scope, $rootScope){
      config = {
        markup:{
          actor: "pl-actor",
          target: "pl-target",
          object: "pl-object",
          role_list: "pl-role-list",
          diff_list: "pl-diff-list",
          role: "mini-tag tag-role",
          lane: "mini-tag tag-lane",
          diff_add: "diff-add",
          diff_rem: "diff-rem",
          diff_change: "diff-change",
          score_table: "pl-score-table",
          score_table_header: "score-header",
          score_table_body: "score-body",
          score_metric: "score-metric",
          score_delta_item: "pl-score-delta-item",
          score_delta_value: "pl-score-delta-value",
          achievement_table: "pl-achievement-table",
          timestamp: "pl-timestamp",
          footer: "pl-footer",
          admin: "pl-admin-event",
          content: "content",
          image: "image",
          dummy_icon: "icon-user"
        }
      }
      $scope.odysseus = $rootScope.odysseus || new Odysseus(config);
    }],

    link: function($scope, iElement, iAttrs){
      $scope.context = $scope.context || 'player';
      var data = {
        context: $scope.context,
        env: $scope.env,
        profile: _.pick($scope.profile, 'alias', 'id'),
        base_url: '/assets/players'
      };
      var story = $scope.odysseus.toHTML($scope.story, data, {image: false});
      iElement.append(story);

      if($scope.context === 'notification'){
        iElement.append("<a class='close-message' data-ng-click='close()'>\n  <i class='icon-cross no-space'></i>\n</a>");
      }

      $scope.close = function(){
        iElement.remove();
        return;
      }

      $scope.$on('destroy', function(){
        iElement.off('.plStoryBuilder');
        return;
      });
    }
  }
})
