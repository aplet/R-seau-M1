$(function(){
  window.fbAsyncInit = function() {
    FB.init({
      appId  : 237593246291922, 
      status : true, 
      cookie : true,
      xfbml  : true
    });

    var session_handle = function(response){
      if (!response.session) return $('#login').show();

      $('#login').hide();

      FB.api('/me/friends', function(response){
        response.data.forEach(function(friend){
          $('#test').append('<div>'+friend.id+" a pour amis : "+'</div>');
//          getMutualFriends(api.get_session().uid, friend.id).forEach(function(mFriend){
             
//		});
          $('#friends').append('<div>'+JSON.stringify(friend)+'</div>');
        });
      });

      FB.XFBML.parse();
    };
    FB.Event.subscribe('auth.sessionChange', session_handle);
    FB.Event.subscribe('auth.login', session_handle);
    FB.getLoginStatus(session_handle);
  };
  (function() {
    var e = document.createElement('script'); e.async = true;
    e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
    document.getElementById('fb-root').appendChild(e);
  }());
});

