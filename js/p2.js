var svg2 = d3.select(".container").append("svg")
	.attr("width", width * 4)
	.attr("height", height)
	.attr("display", 'none');

var showButton = d3.select('button').style('display', 'none');

var visibleNodes,
	invisibleNodes;

function buildCallGraph(filteredNodes, hiddenNodes) {
	visibleNodes = filteredNodes;
	invisibleNodes = hiddenNodes;
	showButton.style('display', 'block');
	showButton.on("click", exampleGraph);
	// showButton.on("click", generateCallGraph);
}

function generateCallGraph() {
	console.log(invisibleNodes);
}

function exampleGraph() {
    var testData = [
        {label: "person a", times: [{"starting_time": 1355752800000, "ending_time": 1355759900000}, {"starting_time": 1355767900000, "ending_time": 1355774400000}]},
        {label: "person b", times: [{"starting_time": 1355759910000, "ending_time": 1355761900000}, ]},
        {label: "person c", times: [{"starting_time": 1355761910000, "ending_time": 1355763910000}]},
    ];
	
	var chart = d3.timeline()
          .stack()
          .margin({left:70, right:30, top:0, bottom:0})
          .click(function (d, i, datum) {
            alert(datum.label);
          })
          .scroll(function (x, scale) {
            // $("#scrolled_date").text(scale.invert(x) + " to " + scale.invert(x+width));
          });
		  
	var t = d3.select('.timeline')
		.attr('width', 500)
		.style('overflow', 'scroll')
		.style('overflow-y', 'hidden');
		
	t.append("svg")
		.attr("width", width * 4)
		.attr("height", 150)
		.attr("display", "true")
		.datum(testData)
		.call(chart);
}