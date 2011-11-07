$(
function(){
window.fbAsyncInit = function() {
	FB.init({
		appId  : 237593246291922, 
		status : true, 
		cookie : true,
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
			$('#friends').append('<div>' + (nb_mutual / 2) + " mutuals\n" + '</div>');
			for(var i in response)
			{
//				$('#test').append('<div>' + response[i]["uid1"] + " <--> " + response[i]["uid2"] + '</div>');
				graphe[response[i]["uid1"]]["voisins"][response[i]["uid2"]] = response[i]["uid2"];
			}
/*
		graphe[0] = new Noeud();
		graphe[1] = new Noeud();
		graphe[2] = new Noeud();
		graphe[3] = new Noeud();
		graphe[4] = new Noeud();
		graphe[5] = new Noeud();
		graphe[0]["voisins"][1] = 1;
		graphe[0]["voisins"][2] = 2;
		graphe[1]["voisins"][0] = 0;
		graphe[1]["voisins"][2] = 2;
		graphe[1]["voisins"][3] = 3;
		graphe[2]["voisins"][0] = 0;
		graphe[2]["voisins"][1] = 1;
		graphe[2]["voisins"][3] = 3;
		graphe[2]["voisins"][4] = 4;
		graphe[3]["voisins"][1] = 1;
		graphe[3]["voisins"][2] = 2;
		graphe[3]["voisins"][4] = 4;
		graphe[3]["voisins"][5] = 5;
		graphe[4]["voisins"][2] = 2;
		graphe[4]["voisins"][3] = 3;
		graphe[4]["voisins"][5] = 5;
		graphe[5]["voisins"][3] = 3;
		graphe[5]["voisins"][4] = 4;
*/
//	}

//	var initialise_pos = function()
//	{
		var tmp = 0, i = 0, j = 0;
		var borne = Math.sqrt(nb_amis);
		$('#friends').append('<div>' + "Borne : "+ borne + "\n" + '</div>');
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

//	var stabilise = function(){
		var id1, id2, voisins, delta_x, delta_y, distance, force;
		var delta_t = 0.06;
		var alpha = 1, k = 0.5;
		var limite = 10;
		var modifie = 1;
//		while(modifie == 1)
		for(var ind = 0 ; ind < 75 ; ind++)
		{
			modifie = 0;
			for(id1 in graphe)
			{
				graphe[id1]["acc_x"] = 0;
				graphe[id1]["acc_y"] = 0;
				for(id2 in graphe)
				{
					if(id1 != id2)
					{
						delta_x = graphe[id1]["pos_x"] - graphe[id2]["pos_x"];
						delta_y = graphe[id1]["pos_y"] - graphe[id2]["pos_y"];
						distance = Math.max(1, Math.sqrt(delta_x * delta_x + delta_y * delta_y));
						force = alpha / (distance * distance);
						graphe[id1]["acc_x"] += force * (delta_x / distance);
						graphe[id1]["acc_y"] += force * (delta_y / distance);
					}
				}
			}
			for(id1 in graphe)
			{
				voisins = graphe[id1]["voisins"];
				for(id2 in voisins)
				{
					delta_x = graphe[id1]["pos_x"] - graphe[id2]["pos_x"];
					delta_y = graphe[id1]["pos_y"] - graphe[id2]["pos_y"];
					distance = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
					force = k * distance;
					graphe[id1]["acc_x"] -= force * (delta_x / distance);
					graphe[id1]["acc_y"] -= force * (delta_y / distance);
				}
				if(graphe[id1]["acc_x"] * graphe[id1]["acc_x"] + graphe[id1]["acc_y"] * graphe[id1]["acc_y"] > limite)
				{
					graphe[id1]["vit_x"] += graphe[id1]["acc_x"] * delta_t;
					graphe[id1]["vit_y"] += graphe[id1]["acc_y"] * delta_t;
					graphe[id1]["pos_x"] += graphe[id1]["vit_x"] * delta_t;
					graphe[id1]["pos_y"] += graphe[id1]["vit_y"] * delta_t;
					if(graphe[id1]["pos_x"] < 5)
						graphe[id1]["pos_x"] = 5;
					if(graphe[id1]["pos_x"] > (width - 5))
						graphe[id1]["pos_x"] = width - 5;
					if(graphe[id1]["pos_y"] < 5)
						graphe[id1]["pos_y"] = 5;
					if(graphe[id1]["pos_y"] > (height - 5))
						graphe[id1]["pos_y"] = height - 5;
					modifie = 1;
				}
			}
		}
//	}

//	var dessine = function()
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
			canvas.circle(graphe[id]["pos_x"], graphe[id]["pos_y"], rayon).attr({fill: "red"});
//			$('#friends').append('<div>' + id + " --> (" + graphe[id]["pos_x"] + ", " + graphe[id]["pos_y"] + ")\n" + '</div>');
		}

		}
		);

		}
		);
	}

	var session_handle = function(response){
		if (!response.session) return $('#login').show();
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

