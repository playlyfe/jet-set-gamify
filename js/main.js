app = angular.module('simpleTodo',[]);

app.run(function(){
  client = new Playlyfe.init({
    client_id: 'MzY1ZmY3MzUtNzE3Ny00NDA0LTlkYzYtNzMxZWQxNzQ2YTQ2',
    redirect_uri: 'http://localhost:8081'
  })
});
