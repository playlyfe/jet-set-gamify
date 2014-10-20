app = angular.module('simpleTodo',[]);

app.run(function(){
  client = new Playlyfe.init({
    client_id: 'CLIENT_ID',
    redirect_uri: 'http://localhost:8081'
  })
});
