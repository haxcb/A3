// var svg2 = d3.select(".container").append("svg")
	// .attr("width", width * 4)
	// .attr("height", height)
	// .attr("display", 'none');

var showButton = d3.select('button').style('display', 'none');

var allNodes = [],
	visibleNodes = []
	invisibleNodes = [];

function buildCallGraph(filteredNodes, hiddenNodes) {
	allNodes = filteredNodes;
	invisibleNodes = hiddenNodes;
	showButton.style('display', 'block');
	// showButton.on("click", exampleGraph);
	showButton.on("click", generateCallGraph);
}

function generateCallGraph() {

	visibleNodes = getMissingNodes(allNodes, invisibleNodes);

	// Initialize the array of timed node objects
	var timedNodes = [];
	for(var i in visibleNodes) {
		timedNodes.push({
			label: visibleNodes[i].id,
			times: []
		});
	}
	
	// Add times & durations to to array
	for(var i in allFilteredLinks) {
		if(isLinkExist(allFilteredLinks[i], visibleNodes)) {
			var nodeIndex = -1;
			
			if(allFilteredLinks[i].source.id != selectedNum) {
				nodeIndex = findNodeIndex(allFilteredLinks[i].source, visibleNodes);
				
			} else if(allFilteredLinks[i].target.id != selectedNum) {
				nodeIndex = findNodeIndex(allFilteredLinks[i].target, visibleNodes);
			}
			if(nodeIndex > -1)
				timedNodes[nodeIndex].times.push(buildTimedNodes(allFilteredLinks[i]));
		}
	}
	
	// Remove the currently selected node
	var selectedIndex = -1;
	for(var i in timedNodes) {
		if(parseInt(timedNodes[i].label) === parseInt(selectedNum)) {
			selectedIndex = i;
			break;
		}
	}	
	timedNodes.splice(selectedIndex, 1);
	
	// Build chart
	var chart = d3.timeline()
		.stack()
		.margin({left:70, right:10, top:0, bottom:0})
		.display("circle")
		.elementMargin(5)
		.colors(d3.scale.ordinal().range(['#FFA3A3','#FF5252']))
		.background(gray)
		.rowSeperators(d3.rgb(100, 100, 100))
		.itemHeight(10)
		.itemMargin(20)
		.tickFormat({
			format: d3.time.format("%b %e"),
			tickTime: d3.time.hours,
			tickInterval: 50,
			tickSize: 6
		})
		.click(function (d, i, datum) {
			alert(datum.label);
		});
		  
	// Set timeline width
	var t = d3.select('.timeline')
		.attr('width', 500);
		
	// Clear timeline	
	t.html('');
	
	t.append('text')
		.text('Phone #');
	
	t.append('text')
		.text('Calls')
		.attr("class", "calls");
	
	// Add svg to timeline with data
	t.append("svg")
		.attr("width", width)
		.attr("height", 50+ 33*timedNodes.length)
		.attr("display", "true")
		.datum(timedNodes)
		.call(chart);
		
	// Adjust stroke of circles
	t.selectAll('circle')
		.attr('stroke', gray);

	// Stretch row lines to go all the way left
	d3.selectAll('.row-seperator')
		.attr('x1', 0);	
}


function buildTimedNodes(node) {
	var end = addSeconds(node.time, node.duration);
	var start = convertToMilliseconds(node.time);
		
	return {
		'starting_time':start,
		'ending_time':end
	};
}

function addSeconds(start, duration) {
	var time = convertToMilliseconds(start);
	var date = new Date();
	date.setTime(time);
	date.setSeconds(date.getSeconds() + duration);
	return date.getTime();
}


function convertToMilliseconds(str) {
	var date = new Date();
	date.setDate(parseInt(str.slice(6, 8))); // Set date
	date.setMonth(parseInt(str.slice(4, 6))-1); // Set month
	date.setFullYear(parseInt(str.slice(0, 4))); // Set year
	date.setHours(parseInt(str.slice(9, 11))); // Set hours
	date.setMinutes(parseInt(str.slice(11, 13))); // Set minutes
	date.setSeconds(0); // Set seconds
	return date.getTime();
}


function isLinkExist(link, nodeArr) {
	return (findNodeIndex(link.target, nodeArr) > -1 
		 && findNodeIndex(link.source, nodeArr) > -1);
}


function getMissingNodes(allItems, someItems) {
	var missingItems = [];
	
	for(var i in allItems) {
		if(findNodeIndex(allItems[i], someItems) < 0) {
			missingItems.push(allItems[i]);
		}
	}
	return missingItems;
}