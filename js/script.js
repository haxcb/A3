$(document).ready(function() {
	var width = 960,
		height = 800;

	var color = d3.scale.category20();

	var force = d3.layout.force()
		.charge(-500)
		.linkDistance(50)
		.size([width, height]);

	var svg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height);

		
	d3.json("../data/cell.json", function(error, json) {
		var opts = '';
		for(var i in json.nodes) {
			opts += '<option value="' + i + '">' + i + '</option>';
		}
		$('.numbers').html(opts);
		
		var links = {};
		var nodes = {};


		force.on("tick", function() {
			links.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });
			nodes.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
		});
		
		

		function buildGraph(filteredNodes, filteredLinks) {
			force
				.nodes(filteredNodes)
				.links(filteredLinks)
				.start();

			links = svg.selectAll(".link")
				.data(filteredLinks)
				.enter().append("line")
				.attr("class", "link")
				.style("stroke-width", function(d) { return Math.sqrt(d.value); });

			nodes = svg.selectAll(".node")
				.data(filteredNodes)
				.enter().append("g")
				.attr("class", "node")
				.attr("r", 5)
				.style("fill", function(d, i) { return color(128); })
				.call(force.drag);
					
			nodes.append("circle")		
				.attr("r", 5)
				.style("fill", function(d, i) { return color(128); });		
			
			var txt = nodes.append("text");
			txt.attr("dx", 12);
			txt.attr("dy", ".35em");
			txt.text(function(d) {return d.id});
			
			nodes.on('click', clickHandler);
			d3.behavior.drag().on('dragend', dragEndHandler);
			
		}
			
		function clickHandler(d, i) {
			var selectedNode = d3.select(nodes[0][i]);
			var selectedCircle = selectedNode.select("circle");
			selectedCircle.style("fill", "red");
			// console.log("SELECTED:  " + filteredNodes[i].id);
		}
		
		d3.select("select").on("change", function(){
			svg.html('');
			
			var drawNodes = [];
			var drawLinks = [];
			
			var selectedNum = $('select').val();
			
			drawNodes.push(json.nodes[selectedNum]);
			
			for(var i in json.links) {
				
				// Check if any links have a matching source to the selection
				if(json.links[i].source == selectedNum) {	
					
					var found = false;
					for(var j in drawNodes) {
						if(drawNodes[j].id === json.nodes[json.links[i].target].id)
							found = true;
					}
					if(!found)
						drawNodes.push(json.nodes[json.links[i].target]);
					
					// drawNodes.pushIfNotExist(json.nodes[json.links[i].target], function(e) { 
						// return e.id === json.nodes[json.links[i].target].id; 
					// });
					
					drawLinks.push(json.links[i]);
				
				// Check if any links have a matching target to the selection
				} else if(json.links[i].target == selectedNum) {
				
					var found = false;
					for(var j in drawNodes) {
						if(drawNodes[j].id === json.nodes[json.links[i].source].id)
							found = true;
					}
					if(!found)
						drawNodes.push(json.nodes[json.links[i].source]);
				
					// drawNodes.pushIfNotExist(json.nodes[json.links[i].source], function(e) { 
						// return e.id === json.nodes[json.links[i].source].id; 
					// });
					
					drawLinks.push(json.links[i]);
				}
			}
			
			
			console.log(drawNodes);
			buildGraph(json.nodes, drawLinks);
			
			/*
			// RESET
			nodes.selectAll("circle")
				.attr("display", "true")
			nodes.selectAll("text") 
				.attr("display", "true"); 
				
			svg.selectAll("line")
				.attr("display", "true");
		
			// FILTER
				
			// Keep track of nodes that are connected to the selected node
			var joinedNodes = [parseInt(selectedNum)];
			
			// Filter out irrelevant lines
			svg.selectAll("line")
				.filter(function(d) { 
					if(d.source.id != selectedNum && d.target.id != selectedNum) {
						return true;
					} else if(d.source.id == selectedNum) {
						joinedNodes.push(d.target.id);
					} else if(d.target.id == selectedNum) {
						joinedNodes.push(d.source.id);
					}
					return false;
				})
				.attr("display", "none");
				
			// console.log(joinedNodes);	
				
			// Filter out irrelevant circles
			nodes.selectAll("circle")
				.filter(function(d) {
					return jQuery.inArray(d.id, joinedNodes) == -1;
				})
				.attr("display", "none");
				
			// Filter out irrelevant text
			nodes.selectAll("text") 
				.filter(function(d) {
					return jQuery.inArray(d.id, joinedNodes) == -1 && d.id != selectedNum;
				})
				.attr("display", "none"); 
			
			// Filter out irrelevant lines
			svg.selectAll("line")
				.filter(function(d) { return d.source.id != selectedNum && d.target.id != selectedNum })
				.attr("display", "none");
				*/
			
		});
		
		
		// Array.prototype.inArray = function(comparer) { 
			// for(var i=0; i < this.length; i++) { 
				// if(comparer(this[i])) return true; 
			// }
			// return false; 
		// }; 
		
		// Array.prototype.pushIfNotExist = function(element, comparer) { 
			// if (!this.inArray(comparer)) {
				// this.push(element);
			// }
		// };		
		
		function dragEndHandler() {
			console.log("ENDED");
		}
	});
});