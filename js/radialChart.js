RadialChart = function (_parentElement) {
    this.parentElement = _parentElement;

    this.initVis();
};

RadialChart.prototype.initVis = function () {
    var vis = this;

	vis.svg = d3.select(vis.parentElement).append("svg")
		.attr("width", 310)
		.attr("height", 300);
	vis.svg_legend = d3.select(vis.parentElement).append("svg")
		.attr("width", 400)
		.attr("height", 125)
		.attr("id","svg_legend");

	vis.div_check = d3.select(vis.parentElement).append("div")
		.attr("width", 600)
		.attr("id","div_checks");

	vis.radialScale = d3.scaleLinear()
		.domain([0,10])
        .range([0,100]);
        
	vis.ticks = [2,4,6,8,10];

	vis.ticks.forEach(t =>
		vis.svg.append("circle")
		.attr("cx", 140)
		.attr("cy", 140)
		.attr("fill", "none")
		.attr("stroke", "gray")
		.attr("r", vis.radialScale(t))
	);

	vis.ticks.forEach(t =>
		vis.svg.append("text")
		.attr("x", 140)
		.attr("y", 140 - vis.radialScale(t))
		.attr("fill","white")
		.attr("font-size","10px")
		.text(t.toString())
	);

    function angleToCoordinate(angle, value){
		let x = Math.cos(angle) * value;
		let y = Math.sin(angle) * value;
		return {"x": 140 + x, "y": 140 - y};
    }
    vis.angleToCoordinate = angleToCoordinate;

	vis.feat_axis = [];
    vis.features = ["avg_rating","num_fans","num_votes","owned","weight"];

	for (var i = 0; i < vis.features.length; i++) {
		let ft_name = vis.features[i];
		let angle = (Math.PI / 2) + (2 * Math.PI * i / vis.features.length);
		let line_coordinate = angleToCoordinate(angle, vis.radialScale(11.5));
		let label_coordinate = angleToCoordinate(angle, vis.radialScale(13));

		vis.feat_axis.push( d3.scaleLinear().range([0,100]));
		//feat_max_min.push(d3.extent(data, function (d) { return d[ft_name]; }))
		//vis.feat_axis[i].domain(Array(feat_max_min[i][0]*0.8,feat_max_min[i][1]*1.2))
		//.range([0,100]);

		//draw axis line
		vis.svg.append("line")
		.attr("x1", 140)
		.attr("y1", 140)
		.attr("x2", line_coordinate.x)
		.attr("y2", line_coordinate.y)
		.attr("stroke","white");
	
		//draw axis label
		vis.svg.append("text")
		.attr("x", label_coordinate.x)
		.attr("y", label_coordinate.y)
		.attr("fill","white")
		.attr("font-size","10px")
		.text(ft_name);
    }
    
    vis.wrangleData();

}

RadialChart.prototype.wrangleData = function () {
    var vis = this;
    vis.minValue = minvalue;
    vis.maxValue = maxvalue;

    vis.mechs_cat = d3.select('#mechs_cat')
    .property('value');


    vis.dataFiltered = filteredData.filter(function (d) {
        return ((d.year >= vis.minValue) && (d.year <= vis.maxValue))
    })

    if(selectedClickedMechs.size!=0){
        vis.dataFiltered = vis.dataFiltered.filter(function(d){
            return selectedClickedMechs.has(String(d[vis.mechs_cat]));
        })
    }
    
    vis.dataFiltered = vis.dataFiltered.slice(0,3);

    vis.updateVis();

}

RadialChart.prototype.updateVis = function () {
    var vis = this;

    feat_max_min = []
    for (var i = 0; i < vis.features.length; i++) {
        let ft_name = vis.features[i];
        feat_max_min.push(d3.extent(filteredData, function (d) { return d[ft_name]; }))
	    vis.feat_axis[i].domain(Array(feat_max_min[i][0]*0.9,feat_max_min[i][1]*1.1))

    }


    let line = d3.line()
    .x(d => d.x)
    .y(d => d.y);
	let colors = ["a","b","c","d","e","f","g","h","i"];
	var color = d3.scaleOrdinal(d3.schemeSet1);
	color.domain(colors)

    
    function getPathCoordinates(data_point){
		let coordinates = [];
		for (var i = 0; i < vis.features.length; i++){
			let ft_name = vis.features[i];
			let angle = (Math.PI / 2) + (2 * Math.PI * i / vis.features.length);
			coordinates.push(vis.angleToCoordinate(angle, vis.feat_axis[i](data_point[ft_name])));
		}
		let ft_name = vis.features[0];
		let angle = (Math.PI / 2) + (2 * Math.PI * 0 / vis.features.length);
		coordinates.push(vis.angleToCoordinate(angle, vis.feat_axis[0](data_point[ft_name])));
		
		return coordinates;
	}

	vis.svg.selectAll('.path-radial')
		.data(vis.dataFiltered)
		.join(
			enter => enter
				.append("path")
				.attr('class', 'path-radial')
				.attr('id', function (d){
					
					return "path"+d.rank.toString()
				})
				.datum(function (d){
					
					return getPathCoordinates(d)
				})
				.attr("d",line)
				.attr("fill",(d,i) => color(colors[i]))
				.attr("fill-opacity", 0.3)
				.attr("stroke-width", 3)
				.attr("stroke", (d,i) => color(colors[i]))
				.attr("stroke-opacity", 1)
				.on('mouseover', function (d,i){
					//Dim all blobs
					vis.svg.selectAll('.path-radial')
						.transition().duration(200)
						.style("fill-opacity", 0.1); 
					//Bring back the hovered over blob
					d3.select(this)
						.transition().duration(200)
						.style("fill-opacity", 0.7);	
				})
				.on('mouseout', function(){
					//Bring back all blobs
					vis.svg.selectAll('.path-radial')
						.transition().duration(200)
						.style("fill-opacity", 0.3);
				}),
			
			update => update
				.attr('class', 'path-radial')
				.attr('id', function (d){
					
					return "path"+d.rank.toString()
				})
				.datum(function (d){
					
					return getPathCoordinates(d)
				})
				.transition()
                .duration(700)
				.attr("d",line)
				.attr("stroke-width", 3)
				.attr("stroke", (d,i) => color(colors[i]))
				.attr("fill",(d,i) => color(colors[i]))
				.attr("stroke-opacity", 1)
				.attr("fill-opacity", 0.3)
                .on("end", function () {

                }),
            exit => exit
                .transition()
                .duration(500)
                .style('opacity', 1e-6)
                .remove()
				
		);

		//LEGEND
		// Add one dot in the legend for each name.
	vis.svg_legend.selectAll('.legend-radial')
		.data(vis.dataFiltered)
		.join(
			enter => enter
				.append("circle")
				.attr('class', 'legend-radial')
				.attr("cx", 20)
				.attr("cy", function(d,i){return 10 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
				.attr("r", 7)
				.style("fill", function(d,i){ return color(colors[i])})
				.on('mouseover', function (d,i){
					//Dim all blobs
					vis.svg.selectAll('.path-radial')
						.transition().duration(200)
						.style("fill-opacity", 0.1); 
					//Bring back the hovered over blob
					vis.svg.select("#path"+d.rank.toString())
						.transition().duration(200)
						.style("fill-opacity", 0.7);	
				})
				.on('mouseout', function(){
					//Bring back all blobs
					vis.svg.selectAll('.path-radial')
						.transition().duration(200)
						.style("fill-opacity", 0.3);
				}),
			update => update
				.attr('class', 'legend-radial')
				.attr("cx", 20)
				.attr("cy", function(d,i){return 10 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
				.attr("r", 7)
				.style("fill", function(d,i){ return color(colors[i])}),
			exit => exit
                .transition()
                .duration(500)
                .style('opacity', 1e-6)
				.remove()
		);

		// Add the text in the legend for each game.
		vis.svg_legend.selectAll('.legend-text-radial')
		.data(vis.dataFiltered)
		.join(
			enter => enter
				.append("text")
				.attr('class', 'legend-text-radial')
				.attr("x", 40)
				.attr("y", function(d,i){ return 10 + i*25}) // 10 is where the first dot appears. 25 is the distance between dots
				.style("fill", function(d,i){ return color(colors[i])})
				.text(function(d){ return d.names})
				.attr("text-anchor", "left")
				.style("alignment-baseline", "middle")
				.on('mouseover', function (d,i){
					//Dim all blobs
					vis.svg.selectAll('.path-radial')
						.transition().duration(200)
						.style("fill-opacity", 0.1); 
					//Bring back the hovered over blob
					vis.svg.select("#path"+this.__data__.rank.toString())
						.transition().duration(200)
						.style("fill-opacity", 0.7);	
				})
				.on('mouseout', function(){
					//Bring back all blobs
					vis.svg.selectAll('.path-radial')
						.transition().duration(200)
						.style("fill-opacity", 0.3);
				}),
			update => update
				.attr('class', 'legend-text-radial')
				.attr("x", 40)
				.attr("y", function(d,i){ return 10 + i*25}) // 10 is where the first dot appears. 25 is the distance between dots
				.style("fill", function(d,i){ return color(colors[i])})
				.text(function(d){ return d.names})
				.attr("text-anchor", "left")
				.style("alignment-baseline", "middle"),
			exit => exit
                .transition()
                .duration(500)
                .style('opacity', 1e-6)
				.remove()
		);
		
	////////////////////////////////////////////////////////////
	///CHECK BOXES ABOVE SEARCH, SHOWS THE SELECTED GAMES///////
	////////////////////////////////////////////////////////////

	check = d3.select("#checklist_games");
	check = vis.div_check

	check.selectAll('div')
		.data(vis.dataFiltered)
		.join(
			enter => enter
				.append('div')
				.text((d)=>d.names)
				.append("input")
				.property("checked", function(d) {
					for (var i = 0; i < vis.dataFiltered.length; i++) {
						if(vis.dataFiltered[i].rank == d.rank)
						{	return true
						}
					}	
					return false
				})
				.attr("rank",(d)=>d.rank)
				.attr("type", "checkbox")
				.attr("class","game-check"),
			update => update
				.text((d)=>d.names)
				.append("input")
				.property("checked", function(d) {
					for (var i = 0; i < vis.dataFiltered.length; i++) {
						if(vis.dataFiltered[i].rank == d.rank)
						{	return true
						}
					}	
					return false
				})
				.attr("rank",(d)=>d.rank)
				.attr("type", "checkbox")
				.attr("class","game-check"),
			exit => exit
				.remove()
		);
			
	
	////////////////////////////////////////////////////////////
	///INTERACTIVITY OF CHECK BOXES ABOVE SEARCH////////////////
	////////////////////////////////////////////////////////////
	
	check.selectAll('.game-check').on("change",update_list_selected)
	function update_list_selected(){
		var choices = [];
        d3.selectAll('.game-check').each(function(d){
          cb = d3.select(this);
          if(cb.property("checked")){
            choices.push(+cb._groups[0][0].attributes.rank.value);
          }
		});

		d3.selectAll('.game-check-search').each(function(d){
            cb = d3.select(this);
            if(choices.includes(d.rank)){
                cb.property("checked", true);
            }
            else{
                cb.property("checked", false);
            }
            if(cb.property("checked")){
              choices.push(+cb._groups[0][0].attributes.rank.value);
            }
          });

		vis.dataFiltered = filteredData.filter(line => choices.includes(line.rank));
		vis.updateVis();

		console.log(choices);
		
	}


	///////////////////////////////////////////////
	///SEARCH BAR PLUS CHECK BOXES BELOW///////////
	///////////////////////////////////////////////

	onFilter();
	
	search_box = d3.select('#filterOn')
    d3.select('#filterOn').on('keyup', onFilter);
    
    function onFilter(){

      var filterText = d3.select('#filterOn').property('value');
      
      searchData = filteredData;
      if (filterText !== ""){
        var searchData = filteredData.filter(function(d){
          return (d.names.indexOf(filterText) >= 0);
        });
      }
      
      filtered_div = d3.select('#filteredList');
        
      filtered_div.selectAll('div')
      .data(searchData)
      .join(
        enter => enter
            .append('div')
            .text((d)=>d.names)
			.append("input")
			.attr("type", "checkbox")
            .property("checked", function(d) {
                for (var i = 0; i < vis.dataFiltered.length; i++) {
                    if(vis.dataFiltered[i].rank == d.rank)
                    {	return true
                    }
                }	
                return false
            })
            .attr("rank",(d)=>d.rank)
            .attr("class","game-check-search"),
        update => update
            .text((d)=>d.names)
            .append("input")
            .property("checked", function(d) {
                for (var i = 0; i < radialChart.dataFiltered.length; i++) {
                    if(radialChart.dataFiltered[i].rank == d.rank)
                    {	return true
                    }
                }	
                return false
            })
            .attr("rank",(d)=>d.rank)
            .attr("type", "checkbox")
            .attr("class","game-check-search"),
        exit => exit
            .transition()
            .duration(500)
            .style('opacity', 1e-6)
            .remove()
      );
        
            
            
    
      filtered_div.selectAll('.game-check-search').on("change",update_check_search)
      function update_check_search(){
          var choices_check = {};
          var choices = []
          d3.selectAll('.game-check-search').each(function(d){
            cb = d3.select(this);
            if(cb.property("checked")){
                choices_check[+cb._groups[0][0].attributes.rank.value]=1;
                choices.push(+cb._groups[0][0].attributes.rank.value);
            }
            else{
                choices_check[+cb._groups[0][0].attributes.rank.value]=0;
            }
          });
          
          d3.selectAll('.game-check').each(function(d){
            cb = d3.select(this);
            if(choices_check[d.rank]==1){
                cb.property("checked", true);
            }else if(choices_check[d.rank]==0){
                cb.property("checked", false);
            }
            if(cb.property("checked") && !choices.includes(+cb._groups[0][0].attributes.rank.value)){
              choices.push(+cb._groups[0][0].attributes.rank.value);
            }
          });
          
  
          vis.dataFiltered = filteredData.filter(line => choices.includes(line.rank));
          vis.updateVis();
  
          console.log(choices);
          
      }
    
    }
}
