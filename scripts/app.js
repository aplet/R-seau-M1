$(
function(){
window.fbAsyncInit = function() {
	FB.init({
		appId  : 237593246291922, 
		status : true, 
		cookie : true,
		oauth : true,
		xfbml  : true
	});

	var width = 800;
	var height = 600;
	var rayon = 5;
	var epaisseur = 1;
	var graphe = new Array();

	var Noeud = function(){
		this.pos_x = 0;
		this.pos_y = 0;
		this.vit_x = 0;
		this.vit_y = 0;
		this.acc_x = 0;
		this.acc_y = 0;
		this.voisins = new Array()
	}

	var compteur = 0;

/*
	FB.api(
	{
		method: 'fql.query',
		query: 'SELECT name, pic_small, birthday FROM user WHERE uid=me()'
	},
	function(response) {
		for(var it in response)
		{
//			$('#cible').append('<img src = #(response[it]["pic_small"]) />');
			$('#cible').append('<div>' + "Name : " + response[it]["name"] + '</div>');
			if(response[it]["birthday"])
				$('#cible').append('<div>' + "Birthday : " + response[it]["birthday"] + '</div>');
		}
	}
	);
*/
//	$('#cible').innerHtml = '';

	var affichage = function()
	{
	FB.api(
	{
		method: 'fql.query',
		query: 'SELECT name, pic_small, birthday FROM user WHERE uid=' + this.id
	},
	function(response) {
		$("div").remove(".name");
		for(var it in response)
		{
			$('#image').src = "http://graph.facebook.com/"+response[it]["name"]+"/picture";
			$('#cible').append('<div class="name">' + response[it]["name"] + '</div>');
			if(response[it]["birthday"])
				$('#cible').append('<div>' + "Birthday : " + response[it]["birthday"] + '</div>');
		}
	}
	);
//		$('#cible').innerHtml = '<div>' + "Salut " + (compteur++) + "\n" + '</div>';
	}

//	var remplit = function()
	var fait_tout = function()
	{
		var nb_amis = 0, nb_mutual = 0;
		FB.api(
		{
			method: 'fql.query',
			query: 'SELECT uid1, uid2 FROM friend WHERE uid1=me()'
		},
		function(response) {
			nb_amis = response["length"];
			$('#friends').append('<div>' + nb_amis + " amis\n" + '</div>');
			for(var i in response)
			{
				graphe[response[i]["uid2"]] = new Noeud();
//				$('#test').append('<div>' + response[i]["uid1"] + " --> " + response[i]["uid2"] + '</div>');
			}

		FB.api(
		{
			method: 'fql.query',
			query: 'SELECT uid1, uid2 FROM friend WHERE uid1 IN (SELECT uid2 FROM friend WHERE uid1=me()) AND uid2 IN (SELECT uid2 FROM friend WHERE uid1=me())'
		},
		function(response) {
			nb_mutual = response["length"];
//			$('#friends').append('<div>' + (nb_mutual / 2) + " mutuals\n" + '</div>');
			for(var i in response)
			{
//				$('#test').append('<div>' + response[i]["uid1"] + " <--> " + response[i]["uid2"] + '</div>');
				(graphe[response[i]["uid1"]]["voisins"])[response[i]["uid2"]] = response[i]["uid2"];
				(graphe[response[i]["uid2"]]["voisins"])[response[i]["uid1"]] = response[i]["uid1"];
			}
//	}

//	var initialise_pos = function()
//	{
		var tmp = 0, i = 0, j = 0;
		var borne = Math.sqrt(nb_amis);
//		$('#friends').append('<div>' + "Borne : "+ borne + "\n" + '</div>');
		for(var id in graphe)
		{
			graphe[id]["pos_x"] = 50 + 20 * i;
			graphe[id]["pos_y"] = 50 + 20 * j;
			j++;
			if(j >= borne)
			{
				i++;
				j = 0;
			}
		}
//	}

//	function stabilise(){
		var id1, id2, voisins, delta_x, delta_y, distance, force;
		var delta_t = 0.05;
		var alpha = 100, k = 0.5;
		var min_dist = 2;
		var limite = 0;
		var modifie = 1;
//		while(modifie == 1)
		for(var ind = 0 ; ind < 100 ; ind++)
		{
			modifie = 0;
			for(id1 in graphe)
			{
				var n1 = graphe[id1];
				n1["acc_x"] = 0;
				n1["acc_y"] = 0;
				for(id2 in graphe)
				{
					if(id1 != id2)
					{
						delta_x = n1["pos_x"] - graphe[id2]["pos_x"];
						delta_y = n1["pos_y"] - graphe[id2]["pos_y"];
						distance = Math.max(0.5, Math.sqrt(delta_x * delta_x + delta_y * delta_y));
						force = alpha / (distance * distance);
						n1["acc_x"] += force * (1 + delta_x);
						n1["acc_y"] += force * (1 + delta_y);
					}
				}
			}
			for(id1 in graphe)
			{
				var n1 = graphe[id1];
				voisins = n1["voisins"];
				for(id2 in voisins)
				{
					delta_x = n1["pos_x"] - graphe[id2]["pos_x"];
					delta_y = n1["pos_y"] - graphe[id2]["pos_y"];
					distance = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
					if(distance > min_dist)
					{
						force = k;
						n1["acc_x"] -= force * delta_x;
						n1["acc_y"] -= force * delta_y;
					}
				}
				if(n1["acc_x"] * n1["acc_x"] + n1["acc_y"] * n1["acc_y"] > limite)
				{
					n1["vit_x"] += n1["acc_x"] * delta_t;
					n1["vit_y"] += n1["acc_y"] * delta_t;
				}
					n1["pos_x"] += n1["vit_x"] * delta_t;
					n1["pos_y"] += n1["vit_y"] * delta_t;
/*					if(n1["pos_x"] < (rayon + 1))
						n1["pos_x"] = rayon + 1;
					if(n1["pos_x"] > (width - (rayon + 1)))
						n1["pos_x"] = width - (rayon + 1);
					if(n1["pos_y"] < (rayon + 1))
						n1["pos_y"] = rayon + 1;
					if(n1["pos_y"] > (height - (rayon + 1)))
						n1["pos_y"] = height - (rayon + 1);
*/					modifie = 1;
			}
		}
//	}

//	function normalize()
//	{

	var min_x = 1000000, max_x = -1000000, min_y = 1000000, max_y = -1000000;
	for(var id in graphe)
	{
		var n = graphe[id];
		var x = n["pos_x"];
		var y = n["pos_y"];
		if(min_x > x) min_x = x;
		if(max_x < x) max_x = x;
		if(min_y > y) min_y = y;
		if(max_y < y) max_y = y;
	}
//	$('#test').append('<div>' + "(" + min_x + ", " + max_x + ")" + '</div');
//	$('#test').append('<div>' + "(" + min_y + ", " + max_y + ")" + '</div');
	var c_x = (width - 2) / (max_x - min_x);
	var c_y = (height - 2) / (max_y - min_y);
	for(var id in graphe)
	{
		var n = graphe[id];
		n["pos_x"] = (n["pos_x"] - min_x) * c_x + 1;
		n["pos_y"] = (n["pos_y"] - min_y) * c_y + 1;
//		$('#test').append('<div>' + "(" + n["pos_x"] + ", " + n["pos_y"] + ")" + '</div');
	}

//	function dessine()
//	{
		var canvas = new Raphael(document.getElementById('canvas_container'), width, height);

		//dessin des arêtes
		for(var id1 in graphe)
		{
			for(var id2 in graphe[id1]["voisins"])
			{
				canvas.path("M " + graphe[id1]["pos_x"] + " " + graphe[id1]["pos_y"] + " L " + graphe[id2]["pos_x"] + " " + graphe[id2]["pos_y"]);
			}
		}


//		$('#test').append('<div>' + graphe["length"] + " amis ?\n" + '</div>');
		//dessin des points
		for(var id in graphe)
		{
			canvas.circle(graphe[id]["pos_x"], graphe[id]["pos_y"], rayon)
				.attr({fill: "blue"})
				.mouseover(affichage)
				.id = id;
//				.data("uid", graphe[id])
//			$('#friends').append('<div>' + id + " --> (" + graphe[id]["pos_x"] + ", " + graphe[id]["pos_y"] + ")\n" + '</div>');
		}

		}
		);

		}
		);
	}

	var session_handle = function(response){
		if (!response.authResponse) return $('#login').show();
		$('#login').hide();


		fait_tout();
//		remplit();
//		initialise_pos();
//		stabilise();
//		dessine();

/*
		FB.api('/me/friends', function(response_list){
        response_list.data.forEach(function(friend){
          $('#test').append('<div>'+friend.id+" a pour amis : "+'</div>');
          friends.getMutualFriends(response.id, friend.id).forEach(function(mFriend){
            $('#test').append('<div>'+JSON.stringify(mFriend)+'</div>');
		});
          $('#friends').append('<div>'+JSON.stringify(friend)+'</div>');
        });
      });
*/
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
}()
);

}
);

