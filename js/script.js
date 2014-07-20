var width = 800,
	height = 500,
	radius = 5;

var white = d3.rgb(255, 255, 255);
var pink = d3.rgb(255, 145, 165);
var gray = d3.rgb(222, 222, 222);

var force = d3.layout.force()
	.charge(-500)
	.linkDistance(50)
	.size([width, height]);

var svg = d3.select(".container").append("svg")
	.attr("width", width)
	.attr("height", height);
		
var dataNodes = [],
	dataLinks = [],
	displayedNodes = [],
	displayedLinks = [],
	allFilteredLinks = [];
	
var selectedNum;
	
d3.json("../data/cell.json", function(error, json) {

	dataNodes = json.nodes;
	dataLinks = json.links;
	
	populateDropdown(dataNodes);
	resetSlider(0, 0);	
	d3.select("select").on("change", handleSelectedNumber); 
	
});

function populateDropdown(vals) {
	var opts = '';
	for(var i in dataNodes) {
		opts += '<option value="' + i + '">' + i + '</option>';
	}
	d3.select('.numbers').html(opts);
}

function handleSelectedNumber() {
	selectedNum = d3.event.target.value;
	rebuildNodes();
}

function resetSlider(min, max) {
	var slider = d3.select('.slider');
	var label = d3.select('.callLabel');
	slider.html('');
	if(min === max) {
		label.style("display", "none");
		slider.attr("display", "none");
	} else {
		slider.attr("display", "true");
		label.style('display', 'block');
		var slideScale = d3.scale.linear()
			.domain([min, max]);
		
		var slideSettings = d3.slider().axis(true)
			.scale(slideScale)	
			.on("slide", handleSlider);
		
		slider.call(slideSettings);
	}
}

function handleSlider(e, value) {
	svg.html('');
	var filteredCallFilteredLinks = [];
	var filteredNodeLinks = [];
	var hiddenNodes = [];
	
	for(var i in displayedLinks) {
		// Show nodes above the threshold value
		if(displayedLinks[i].count >= value) {
			filteredCallFilteredLinks.push(displayedLinks[i]);
		} else {
			// Get all nodes that should be hidden
			var hideNode = -1;
			if(selectedNum == displayedLinks[i].target.id) {
				hideNode = findNodeIndex(displayedLinks[i].source, displayedNodes);
			} else if(selectedNum == displayedLinks[i].source.id) {
				hideNode = findNodeIndex(displayedLinks[i].target, displayedNodes);
			}
			if(hideNode > -1) {
				hiddenNodes.push(displayedNodes[hideNode]);
			}
		}
	}
	
	buildGraph(displayedNodes, filteredCallFilteredLinks, hiddenNodes);
}

function rebuildNodes() {
	var drawNodes = []; // Keep track of the currently visible & connected nodes
	var drawLinks = []; // Keep track of currently visible & connected links (no repeats)
	allFilteredLinks = []; // Keep track of currently visible & connected calls (repeats included)
	
	drawNodes.push(dataNodes[selectedNum]);
	
	for(var i in dataLinks) {							
		if(dataLinks[i].source == selectedNum) {	
			// Check if any links have a matching source to the selection
			drawNodes = getDrawableNodes(drawNodes, dataNodes[dataLinks[i].target]);
			drawLinks = getDrawableLinks(drawLinks, dataLinks[i]);				
			allFilteredLinks.push(dataLinks[i]);
		
		} else if(dataLinks[i].target == selectedNum) {		
			// Check if any links have a matching target to the selection				
			drawNodes = getDrawableNodes(drawNodes, dataNodes[dataLinks[i].source]);
			drawLinks = getDrawableLinks(drawLinks, dataLinks[i]);
			allFilteredLinks.push(dataLinks[i]);
		}
	}
	
	var remappedLinks = [];
	var highestNode = drawLinks[0];
	// Remap the links with the correct indices
	for(var i in drawLinks) {
		// Get the source and target nodes
		var sourceNode = drawNodes.filter(function(n) { return n.id === drawLinks[i].source; })[0],
			targetNode = drawNodes.filter(function(n) { return n.id === drawLinks[i].target; })[0];
		
		// Add the edge to the array
		remappedLinks.push({'source': sourceNode, 
							'target': targetNode, 
							'count': drawLinks[i].count,
							'cellTower':drawLinks[i].cellTower, 
							'duration':drawLinks[i].duration, 
							'time':drawLinks[i].time});
		if(drawLinks[i].count > highestNode.count) {
			highestNode = drawLinks[i];
		}
	}
	
	for(var i in allFilteredLinks) {
		var sourceNode = drawNodes.filter(function(n) { return n.id === allFilteredLinks[i].source; })[0],
			targetNode = drawNodes.filter(function(n) { return n.id === allFilteredLinks[i].target; })[0];
		allFilteredLinks[i].source = sourceNode;
		allFilteredLinks[i].target = targetNode;
	}
	
	// Redraw graph with new values
	svg.html('');
	resetSlider(0, highestNode.count);
	
	displayedNodes = drawNodes;
	displayedLinks = remappedLinks;
	
	buildGraph(drawNodes, remappedLinks, []);	
}

function buildGraph(filteredNodes, filteredLinks, hiddenNodes) {
	var links = {};
	var nodes = {};
	
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
		.call(force.drag);
			
	nodes.append("circle")		
		.attr("r", radius)
		.style("fill", pink);
	
	nodes.append("text")
		.attr("dx", 12)
		.attr("dy", ".35em")
		.text(function(d) {return d.id});
		
	// Format text of central node
	nodes.selectAll("text")
		.filter(function(node, index) {
			return node.id == selectedNum;
		})
		.style("text-anchor", 'middle')
		.attr("dx", 0);
	
	// Format circle of central node
	nodes.selectAll("circle")
		.filter(function(node, index) {
			return node.id == selectedNum;
		})
		.attr("r", radius*3)
		.style('stroke', pink)
		.style("stroke-width", 3)
		.style("fill", white);

	// Hide text of hidden nodes
	nodes.selectAll("text")
		.filter(function(node, index) {
			return findNodeIndex(node, hiddenNodes) > -1;
		})
		.style("fill", "gray")
		.attr("display", "none");
	
	// Hide circles of hidden nodes
	nodes.selectAll("circle")
		.filter(function(node, index) {
			return findNodeIndex(node, hiddenNodes) > -1;
		})
		.style("fill", gray)
		.attr("display", "none");
		
	nodes.on("click", clickHandler);
	
	function tick() {
		links.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });
			
		nodes.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
			.attr("cx", function(d) { return d.x = Math.max(radius*2, Math.min(width - radius*2, d.x)); })
			.attr("cy", function(d) { return d.y = Math.max(radius*2, Math.min(height - radius*2, d.y)); });
	}	
	
	buildCallGraph(filteredNodes, hiddenNodes);
}

function clickHandler(d, i) {
	if(selectedNum != d.id) {
		selectedNum = d.id;
		rebuildNodes();
	}
}	

function getDrawableNodes(dNodes, currentNode) {
	if(dNodes.length < 0) {
		dNodes.push(currentNode);
	} else {
		for(var i in dNodes) {
			if(dNodes[i].id === currentNode.id) {
				return dNodes;
			}
		}
		dNodes.push(currentNode);
	}
	return dNodes;
}

function getDrawableLinks(dLinks, currentLink) {			
	if(dLinks.length < 0) {
		dLinks.push(currentLink);
		dLinks[0].count = 1;
	} else {			
		// Loop through links and determine if there are repeats
		for(var i in dLinks) {
			if((dLinks[i].source === currentLink.source && dLinks[i].target === currentLink.target)
				|| (dLinks[i].source === currentLink.target && dLinks[i].target === currentLink.source)) {	
					// The currentLink is a repeat, so increment the count and exit
					dLinks[i].count++;
					return dLinks;
			} 
		}	
		// The currentLink is unique, so add to the list and initialize the count
		dLinks.push(currentLink);
		dLinks[dLinks.length-1].count = 1;
	}
	
	return dLinks;
}	


// Determine whether the node is in the given array
function findNodeIndex(node, nodes) {
	for(var i in nodes) {
		if(nodes[i].id === node.id) {
			return i;
		}
	}
	return -1;
}
