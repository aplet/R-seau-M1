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
	    
	    // Paramètres d'affichage
	    var width = 800;
	    var height = 600;
	    var rayon = 5;
	    var epaisseur = 1;

	    var Noeud = function()
	    {
		this.nom = "";
		this.image = "";
		this.degre = 0;

		this.rond = 0;
		this.couleur = "";

		this.pos_x = 0;
		this.pos_y = 0;
		this.vit_x = 0;
		this.vit_y = 0;
		this.acc_x = 0;
		this.acc_y = 0;

		this.voisins = new Array()
	    }

	    var Arc = function(uid1, uid2)
	    {
		this.uid1 = uid1;
		this.uid2 = uid2;
	    }
	    
	    var monGraphe = new Array();

	    var aretes = new Array();
	    var nb_comms = 0;

	    var affichage = function()
	    {
		var n = monGraphe[this.id];
		$("div").remove(".name");
		$('#image').src = n.image;
		$('#cible').append('<div class="name">' + n.nom + '</div>');
		$('#cible').append('<div class="name">' + n.degre + " amis en commun" + '</div>');
		$('#cible').append('<div class="name">' + n.image + '</div>');
		var v = n.voisins;
		for(var id2 in v)
		{
		    (v[id2]).attr({stroke: "green"});
		    monGraphe[id2].rond.attr({fill: "green"})
			.toFront();
		}
		n.rond.attr({fill: "red"})
		    .toFront();
	    }

	    var desaffichage = function()
	    {
		$("div").remove(".name");
		var n = monGraphe[this.id];
		n.rond.attr({fill: n.couleur});
		var v = n.voisins;
		for(var id2 in v)
		{
		    (v[id2]).attr({stroke: "black"});
		    var n2 = monGraphe[id2];
		    n2.rond.attr({fill: n2.couleur});
		}
	    }
	    
	    function FaitTout()
	    {
		ConstruitNoeuds();
	    }

	    function ConstruitNoeuds()
	    {
		var nb_amis;

		// Recherche des amis et création des noeuds
		FB.api(
		    {
			method: 'fql.query',
			query: 'SELECT uid, name, first_name, last_name FROM user WHERE uid in (SELECT uid2 FROM friend WHERE uid1=me())'
		    },
		    function(response) {
			nb_amis = response["length"];
			$('#friends').append('<div>' + nb_amis + " amis" + '</div>');
			// Création d'un noeud pour chaque amis
			for(var it in response)
			{
			    var id = response[it];
			    monGraphe[id["uid"]] = new Noeud();
			    var n = monGraphe[id["uid"]];
			    n.couleur = "blue";
			    n.nom = id["name"];
			    n.image = "http://graph.facebook.com/"+ id["uid"] +"/picture";
			    //$('#test').append('<div>' + response[i]["uid1"] + " --> " + response[i]["uid2"] + '</div>');
			}

			ConstruitAretes(nb_amis);
		    }
		);
	    }

	    function ConstruitAretes(nb_amis)
	    {
		FB.api(
		    {
			method: 'fql.query',
			query: 'SELECT uid1, uid2 FROM friend WHERE uid1 IN (SELECT uid2 FROM friend WHERE uid1=me()) AND uid2 IN (SELECT uid2 FROM friend WHERE uid1=me())'
		    },
		    function(response) {
			//$('#friends').append('<div>' + (response["length"] / 2) + " mutuals" + '</div>');
			// Création d'une arête pour chaque paire d'amis
			for(var i in response)
			{
			    var r = response[i];
			    var r1 = r["uid1"];
			    var r2 = r["uid2"];
			    //$('#test').append('<div>' + r1 + " <--> " + r2 + '</div>');
			    if(r1 != r2)
			    {
				if(!monGraphe[r1].voisins[r2])
				{
				    (monGraphe[r1].voisins)[r2] = r2;
				    monGraphe[r1].degre = monGraphe[r1].degre + 1;
				}
				if(!monGraphe[r2].voisins[r1])
				{
				    (monGraphe[r2].voisins)[r1] = r2;
				    monGraphe[r2].degre = monGraphe[r2].degre + 1;
				}
			    }
			}
			
			Positionne(nb_amis);
		    }
		);
	    }

	    function Positionne(nb_amis)
	    {
		// Initialisation des positions (sur une grille)
		var i = 0, j = 0;
		var borne = Math.sqrt(nb_amis);
		//$('#friends').append('<div>' + "Borne : "+ borne + '</div>');
		for(var id in monGraphe)
		{
		    var n = monGraphe[id];
		    n.pos_x = 50 + 20 * i;
		    n.pos_y = 50 + 20 * j;
		    j++;
		    if(j >= borne)
		    {
			i++;
			j = 0;
		    }
		}
		
		Stabilise();
	    }
	    
	    function Stabilise()
	    {
		// Paramètres de la stabilisation
		var delta_t = 0.05;
		var alpha = 100, k = 0.5;
		var min_dist = 2;
		var maxDistRep = 400;
		var limite = 0;
		
		var id1, id2, delta_x, delta_y, distance, force;
		var modifie = 1;
		//while(modifie == 1)
		for(var ind = 0 ; ind < 100 ; ind++)
		{
		    modifie = 0;
		    
		    // Calcul des forces
		    for(id1 in monGraphe)
		    {
			var n1 = monGraphe[id1];
			n1.acc_x = 0;
			n1.acc_y = 0;
			
			// Répulsion
			for(id2 in monGraphe)
			{
			    if(id1 != id2)
			    {
				var n2 = monGraphe[id2];
				delta_x = n1.pos_x - n2.pos_x;
				delta_y = n1.pos_y - n2.pos_y;
				distance = Math.max(0.5, Math.sqrt(delta_x * delta_x + delta_y * delta_y));
				if(distance < maxDistRep)
				{
				    force = alpha / (distance * distance);
				    n1.acc_x += force * (1 + delta_x);
				    n1.acc_y += force * (1 + delta_y);
				}
			    }
			}
			
			// Attraction
			var voisins = n1.voisins;
			for(id2 in voisins)
			{
			    var n2 = monGraphe[id2];
			    delta_x = n1.pos_x - n2.pos_x;
			    delta_y = n1.pos_y - n2.pos_y;
			    distance = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
			    if(distance > min_dist)
			    {
				force = k;
				n1.acc_x -= force * delta_x;
				n1.acc_y -= force * delta_y;
			    }
			}
		    }
		    
		    // Déplacements
		    for(id1 in monGraphe)
		    {
			var n1 = monGraphe[id1];
			if(n1.acc_x * n1.acc_x + n1.acc_y * n1.acc_y > limite)
			{
			    n1.vit_x += n1.acc_x * delta_t;
			    n1.vit_y += n1.acc_y * delta_t;
			    n1.pos_x += n1.vit_x * delta_t;
			    n1.pos_y += n1.vit_y * delta_t;
			    /*
			      if(n1["pos_x"] < (rayon + 1))
			      n1["pos_x"] = rayon + 1;
			      if(n1["pos_x"] > (width - (rayon + 1)))
			      n1["pos_x"] = width - (rayon + 1);
			      if(n1["pos_y"] < (rayon + 1))
			      n1["pos_y"] = rayon + 1;
			      if(n1["pos_y"] > (height - (rayon + 1)))
			      n1["pos_y"] = height - (rayon + 1);
			    */
			    modifie = 1;
			}
		    }
		}
		Normalise();
	    }

	    function Normalise()
	    {
		var min_x = 1000000, max_x = -1000000, min_y = 1000000, max_y = -1000000;
		// Recherche des extrema
		for(var id in monGraphe)
		{
		    var n = monGraphe[id];
		    var x = n.pos_x;
		    var y = n.pos_y;
		    if(min_x > x) min_x = x;
		    if(max_x < x) max_x = x;
		    if(min_y > y) min_y = y;
		    if(max_y < y) max_y = y;
		}
		//$('#test').append('<div>' + "(" + min_x + ", " + max_x + ")" + '</div');
		//$('#test').append('<div>' + "(" + min_y + ", " + max_y + ")" + '</div');
		
		// Coefficients de normalisation
		var c_x = (width - 2 * (rayon + 1)) / (max_x - min_x);
		var c_y = (height - 2 * (rayon + 1)) / (max_y - min_y);
		
		// Calcul des positions normalisées
		for(var id in monGraphe)
		{
		    var n = monGraphe[id];
		    n.pos_x = (n.pos_x - min_x) * c_x + rayon + 1;
		    n.pos_y = (n.pos_y - min_y) * c_y + rayon + 1;
		    //$('#test').append('<div>' + "(" + n["pos_x"] + ", " + n["pos_y"] + ")" + '</div');
		}
		Dessine();
	    }

	    function Dessine()
	    {
		//$('#test').append('<div>' + monGraphe["length"] + " amis ?" + '</div>');
		var canvas = new Raphael(document.getElementById('canvas_container'), width, height);
		
		//dessin des arêtes
		for(var id1 in monGraphe)
		{
		    var n1 = monGraphe[id1];
		    var v1 = n1.voisins;
		    for(var id2 in v1)
		    {
			if(id1 < id2)
			{
			    var n2 = monGraphe[id2];
			    v1[id2] = canvas.path("M " + n1.pos_x + " " + n1.pos_y + " L " + n2.pos_x + " " + n2.pos_y);
			    v1[id2].id = nb_comms;
			    nb_comms = nb_comms + 1;
			    n2.voisins[id1] = v1[id2];
			    aretes[nb_comms - 1] = new Array();
			    aretes[nb_comms - 1][0] = new Arc(id1, id2);
			}
		    }
		}

		$('#friends').append('<div>' + nb_comms + " arêtes (" + aretes.length + ")" + '</div>');
		
		//dessin des points
		for(var id in monGraphe)
		{
		    var n = monGraphe[id];
		    var c = canvas.circle(n.pos_x, n.pos_y, rayon);
		    c.attr({fill: "blue"})
			.mouseover(affichage)
			.mouseout(desaffichage)
			.id = id;
		    n.rond = c;
		    //$('#friends').append('<div>' + id + " --> (" + n["pos_x"] + ", " + n["pos_y"] + ")" + '</div>');
		}

		DetecteCommunautes(3);
	    }

	    function DetecteCommunautes(k)
	    {
		if(k == 3)
		{
		    Detecte3Clique();
		}
		else
		{
		    $('#test').append('<div>' + "Gestion des communautés avec un paramètre différent de 3 (" + k + ") pas encore géré." + '</div>');
		}
	    }

	    function Detecte3Clique()
	    {
		for(var id1 in monGraphe)
		{
		    var n1 = monGraphe[id1];
		    var v1 = n1.voisins;
		    for(var id2 in v1) // Parcours des aretes
		    {
			if(id1 < id2)
			{
			    var v2 = monGraphe[id2].voisins;
			    for(var id3 in v1)
			    {
				if(id2 < id3 && v2[id3]) // On fusionne les communautes
				{
				    var c1 = v1[id2].id;
				    var c2 = v2[id3].id;
				    var c3 = v1[id3].id;
				    var c = Math.min(Math.min(c1, c2), c3);
				    //DeplaceComm(c1, c);
				    if(c1 != c)
				    {
					nb_comms = nb_comms - 1;
					var a = aretes[c1];
					var na = aretes[c];
					var l = na.length;
					for(var it in a)
					{
					    var arete = a[it];
					    var uid1 = arete.uid1;
					    var uid2 = arete.uid2;
					    monGraphe[uid1].voisins[uid2].id = c;
					    na[l] = arete;
					    l = l + 1;
					}
				    }
				    //DeplaceComm(c2, c);
				    if(c2 != c)
				    {
					nb_comms = nb_comms - 1;
					var a = aretes[c2];
					var na = aretes[c];
					var l = na.length;
					for(var it in a)
					{
					    var arete = a[it];
					    var uid1 = arete.uid1;
					    var uid2 = arete.uid2;
					    monGraphe[uid1].voisins[uid2].id = c;
					    na[l] = arete;
					    l = l + 1;
					}
				    }
				    //DeplaceComm(c3, c);
				    if(c3 != c)
				    {
					nb_comms = nb_comms - 1;
					var a = aretes[c3];
					var na = aretes[c];
					var l = na.length;
					for(var it in a)
					{
					    var arete = a[it];
					    var uid1 = arete.uid1;
					    var uid2 = arete.uid2;
					    monGraphe[uid1].voisins[uid2].id = c;
					    na[l] = arete;
					    l = l + 1;
					}
				    }
				}
			    }
			}
		    }
		}
		
		$('#friends').append('<div>' + nb_comms + " communautés" + '</div>');
	    }
/*
	    function DeplaceComm(comm, newComm)
	    {
		if(comm != newComm)
		{
		    nb_comms = nb_comms - 1;
		    var a = aretes[comm];
		    var na = aretes[newComm];
		    var l = na.length;
		    for(var it in a)
		    {
			var arete = a[it];
			var uid1 = arete.uid1;
			var uid2 = arete.uid2;
			monGraphe[uid1].voisins[uid2].id = newComm;
			na[l] = arete;
			l = l + 1;
		    }
		}
	    }	    
*/
	    var session_handle = function(response){
		if (!response.authResponse) return $('#login').show();
		$('#login').hide();
		
		FaitTout();

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

