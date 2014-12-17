/*
 * the general logic is the following : 
 * 1) interactive actions are pushed in firebase 
 * 2) changes in firebase are caught by d3fire callback functions
 */

var svg = d3.select("svg").on("mousedown", mousedown);

var select; // node being edited
var w = 50, h = 20; // node size, constant for now

function mousedown() {
	var point = d3.mouse(this);
	point.x = point[0];
	point.y = point[1];
	// find node under
	var nodes = svg.selectAll(".node")[0];
	select = find(nodes, function(n) {
		return Boolean(dist(point, n) < 30);
	});

	// if Shift is pressed, we create a new node and link it from the node under
	// cursor
	if (d3.event.shiftKey) {
		var newnode = fbase.push({
			'x' : point.x,
			'y' : point.y
		});

		if (select != null) {
			// add a link
		}

		select = newnode;
	}
}

width = parseInt(svg.style('width'), 10);
height = parseInt(svg.style('height'), 10);

var packer = d3.layout.force()
	.size([ width, height ])
	.charge(-1000) //repulsion
	.theta(0.5) // damping
	.linkDistance(w + h);

function layoutGraph() {
	var nodes = svg.selectAll(".node")[0],
		links = svg.selectAll(".link")[0];

	packer
		.nodes(nodes)
		.links(links)
		.start();

	function path(d) {
		var x1 = d.source.x, y1 = d.source.y, x2 = d.target.x, y2 = d.target.y, dx = x2
				- x1, dy = y2 - y1, a = Math.abs(dy) / Math.abs(dx);

		if (a > h / w) {
			y1 = y1 + sign(dy) * h / 2;
			y2 = y2 - sign(dy) * h / 2;
		} else {
			x1 = x1 + sign(dx) * w / 2;
			x2 = x2 - sign(dx) * w / 2;
		}

		return "M" + x1 + "," + y1 + "L" + x2 + "," + y2;
	}

	packer.on("tick", function(d) {
		// bounding box effect :
		// http://mbostock.github.io/d3/talk/20110921/bounding.html
        packer.nodes().forEach(function(d) {
            d3.select(d)
            	.attr("cx", d.x = Math.max(w / 2, Math.min(width - w / 2, d.x)))
	    		.attr("cy", d.y = Math.max(h / 2, Math.min(height - h / 2, d.y)))
	    		.attr("transform", "translate(" + d.x + "," + d.y + ")");
        });
        packer.links().forEach(function(node) {
        	d3.select(link).attr("d", path);
        });
	});

}

function createNode(data) {
	var val=data.val(),
		id=data.key();
	g = svg.append("g")
		.call(packer.drag)
		.attr("class", "node")
		.attr("id",id);
	style=null;
	if (val.color) {style="fill:"+val.color+";";}
	g.append('rect')
		.attr("class", val.type)
		.attr("style", style)
		.attr("x", -w / 2)
		.attr("y", -h / 2)
		.attr("width", w)
		.attr("height", h)
		.attr("title", val.label);
	g.append("text")
		.attr("text-anchor", "middle")
		.attr("dominant-baseline","central")
		.text(val.label);

	return g;
};

var fbase = new Firebase(
		'https://brilliant-heat-1116.firebaseio.com/Graph/test');

svg.firebase(fbase, {
	// format of the data param is here : https://www.firebase.com/docs/web/api/datasnapshot/

	createFunc : function(data) {
		console.log('createFunc called', data.key(), data.val());
		g=createNode(data);
		layoutGraph();
		return g;
	},

	updateFunc : function(data) {
		console.log('updateFunc called', data.key(), data.val());
		this.remove(); // delete and re-create because it's easier ...
		g=createNode(data);
		layoutGraph();
		return g;
	},

	deleteFunc : function(data) {
		console.log('deleteFunc called', data.key(), data.val());
		this.remove();
		layoutGraph();
	}
});

function updateGraph() {
	node = node.data(nodes);
	g = node.enter().append("g").call(force.drag).attr("class", "node").attr(
			"id", function(d) {
				return "n" + d.id;
			});
	g.append("rect").attr("class", function(d) {
		return d.type;
	}).attr("x", -w / 2).attr("y", -h / 2).attr("width", w).attr("height", h)
			.attr("title", function(d) {
				return d.text;
			});
	g.append("text").attr("text-anchor", "middle").attr("dominant-baseline",
			"central").text(function(d) {
		return d.label;
	});

	link = link.data(links);
	link.enter().append("path").attr("class", "link").attr("marker-end",
			"url(#arrow)");

}

svg.append("defs").selectAll("marker").data([ "arrow" ]) // types. we use
// only one
.enter().append("marker").attr("id", function(d) {
	return d;
}).attr("viewBox", "0 -5 10 10").attr("refX", 15).attr("refY", -1.5).attr(
		"markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto")
		.append("path").attr("d", "M0,-5L10,0L0,5");

var div = d3.select("body").append("div") // declare the tooltip div
.attr("class", "tooltip") // apply the 'tooltip' class
.style("opacity", 0); // set the opacity to nil

