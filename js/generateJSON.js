var width = 960,
    height = 500;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([width, height]);

d3.json("../data/cellOrig.json", function(error, graph) {
	// /* Print links */
	var node = d3.select("body").selectAll("p")
		.data(graph.nodes)
		.enter().append("p")
		.text(function(d) {return '{ "source":' + d.source + ', "target":' + d.target + ', "cellTower":' + d.cellTower + '},'});

			  
	/* Print nodes */	
		// var max = 0;
		// for(var i = 0; i < graph.nodes.length; i++) {
			// if(max < graph.nodes[i].source) {
				// max = graph.nodes[i].source;
			// }
		// }
		// console.log(max);
		// for(var i = 0; i <= max; i++) {
			// d3.select("body")
				// .append("p")
				// .text('{ "id":' + i + ' },');
		// }
});