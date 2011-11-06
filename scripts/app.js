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

	var dilate = function(c){
		return (20 * (1 + c));
	}

	var Noeud = function(){
		this.pos_x = 0;
		this.pos_y = 0;
		this.vit_x = 0;
		this.vit_y = 0;
		this.acc_x = 0;
		this.acc_y = 0;
		this.voisins = new Array()
	}

	var remplit = function(graphe)
	{
		graphe[0] = new Noeud();
		graphe[1] = new Noeud();
		graphe[0]["voisins"][0] = 1;
		graphe[1]["voisins"][0] = 0;
	}

	var initialise_pos = function(graphe)
	{
		var tmp = 0, i = 0, j = 0;
		var taille = graphe["length"];
		var borne = Math.sqrt(taille);
		for(var id in graphe)
		{
			graphe[id]["pos_x"] = i;
			graphe[id]["pos_y"] = j;
			j++;
			if(j >= borne)
			{
				i++;
				j = 0;
			}
		}
	}

	var stabilise = function(graphe){
		var id1, id2, voisins, delta_x, delta_y, distance, force;
		var delta_t = 1;
		var alpha = 1, k = 1;
		var limite = 10;
		var modifie = 1;
		while(modifie == 1)
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
					modifie = 1;
				}
			}
		}
	}

	var dessine = function(graphe)
	{
		var canvas = new Raphael(document.getElementById('canvas_container'), width, height);

		//dessin des arêtes
		for(var id1 in graphe)
		{
			for(var id2 in graphe[id1]["voisins"])
			{
				canvas.path("M " + dilate(graphe[id1]["pos_x"]) + " " + dilate(graphe[id1]["pos_y"]) + " L " + dilate(graphe[id2]["pos_x"]) + " " + dilate(graphe[id2]["pos_y"]));
			}
		}

		//dessin des points
		for(var id in graphe)
		{
			canvas.circle(dilate(graphe[id]["pos_x"]), dilate(graphe[id]["pos_y"]), rayon).attr({fill: "red"});
			$('#test').append('<div>' + id + " --> (" + graphe[id]["pos_x"] + ", " + graphe[id]["pos_y"] + ")\n" + '</div>');
		}
		canvas.circle(50, 50, 10).attr({fill: "red"});
	}

	var session_handle = function(response){
		if (!response.session) return $('#login').show();
		$('#login').hide();

		var graphe = new Array();

		remplit(graphe);
		initialise_pos(graphe);
		stabilise(graphe);
		dessine(graphe);

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

