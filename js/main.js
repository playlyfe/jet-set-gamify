app = angular.module('simpleTodo',[]);

app.run(function(){
  client = new Playlyfe.init({
    client_id: 'N2IzZDdiNDMtNGZkNC00MTEwLTg3ZWEtMmU1NzZlNTMyYjkz',
    redirect_uri: 'http://playlyfe.github.io/jet-set-gamify/'
  })
});
