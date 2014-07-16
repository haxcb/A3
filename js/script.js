
	var width = 960,
		height = 800,
		radius = 5;

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
		d3.select('.numbers').html(opts);
		
		var links = {};
		var nodes = {};
				

		function buildGraph(filteredNodes, filteredLinks) {
			force
				.nodes(filteredNodes)
				.links(filteredLinks)
				.on("tick", tick)
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
				.attr("r", radius)
				.style("fill", function(d, i) { return color(128); })
				.call(force.drag);
					
			nodes.append("circle")		
				.attr("r", radius)
				.style("fill", function(d, i) { return color(128); });		
				
			
			var slider = d3.select('.slider');

			var slideSettings = d3.slider().axis(true);
			slideSettings.on("slide", function(evt, value) {
				console.log(value);
			});
				
			slider.call(slideSettings);
			
			var txt = nodes.append("text");
			txt.attr("dx", 12);
			txt.attr("dy", ".35em");
			txt.text(function(d) {return d.id});
			
			nodes.on('click', clickHandler);
			d3.behavior.drag().on('dragend', dragEndHandler);
			
			function tick() {
				links.attr("x1", function(d) { return d.source.x; })
					.attr("y1", function(d) { return d.source.y; })
					.attr("x2", function(d) { return d.target.x; })
					.attr("y2", function(d) { return d.target.y; });
					
				nodes.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
					.attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
					.attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });
		}
			
		}
			
		function clickHandler(d, i) {
			var selectedNode = d3.select(nodes[0][i]);
			var selectedCircle = selectedNode.select("circle");
			selectedCircle.style("fill", "red");
			// console.log("SELECTED:  " + filteredNodes[i].id);
		}
		
		
		d3.select("select").on("change", function(){
			svg.html('');
			
			var drawNodes = []; // Keep track of the currently visible & connected nodes
			var drawLinks = []; // Keep track of currently visible & connected links
			
			var selectedNum = d3.event.target.value;
			
			drawNodes.push(json.nodes[selectedNum]);
			
			for(var i in json.links) {
				
				// Check if any links have a matching source to the selection
				if(json.links[i].source == selectedNum) {	
					
					drawNodes.pushIfNotExist(json.nodes[json.links[i].target], function(e) { 
						return e.id === json.nodes[json.links[i].target].id; 
					});
					
					drawLinks.push(json.links[i]);
				
				// Check if any links have a matching target to the selection
				} else if(json.links[i].target == selectedNum) {
							
					drawNodes.pushIfNotExist(json.nodes[json.links[i].source], function(e) { 
						return e.id === json.nodes[json.links[i].source].id; 
					});
					
					drawLinks.push(json.links[i]);
				}
			}
			
			var remappedLinks = [];

			drawLinks.forEach(function(e) { 
				// Get the source and target nodes
				var sourceNode = drawNodes.filter(function(n) { return n.id === e.source; })[0],
					targetNode = drawNodes.filter(function(n) { return n.id === e.target; })[0];

				// Add the edge to the array
				remappedLinks.push({'source': sourceNode, 'target': targetNode, 'cellTower':e.cellTower, 'duration':e.duration, 'time':e.time});
			});

			buildGraph(drawNodes, remappedLinks);
			
		});
		
		
		Array.prototype.inArray = function(comparer) { 
			for(var i=0; i < this.length; i++) { 
				if(comparer(this[i])) return true; 
			}
			return false; 
		}; 
		
		Array.prototype.pushIfNotExist = function(element, comparer) { 
			if (!this.inArray(comparer)) {
				this.push(element);
			}
		};		
		
		function dragEndHandler() {
			console.log("ENDED");
		}
	});
