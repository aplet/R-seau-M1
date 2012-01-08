<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="https://www.facebook.com/2008/fbml">
<head>
  <title>Check your friends</title>
	<style>
<!--
        #image{position: fixed; left: 820px; top: 50px}
	.cible_t{position: fixed; left: 825px; top: 10px;}
-->
	</style>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js" type="text/javascript" charset="utf-8"></script>
  <script src="scripts/raphael-min.js" type="text/javascript" charset="utf-8"></script>
  <script src="scripts/app.js" type="text/javascript" charset="utf-8"></script>
  <link rel="stylesheet" href="/stylesheets/style.css" type="text/css" media="screen" title="no title" charset="utf-8" />
</head>

<body>
  <div id="fb-root"></div>
  <div id="login"><fb:login-button>Connect with Facebook</fb:login-button></div>
  <div id="canvas_container"></div>
  <p>
    <img class=apercu id="image" src="">
  </p>
  <div class=cible_t id="cible"></div>
  
  <pre id="friends"></pre>
  <pre id="test"></pre>
</body>

</html>
