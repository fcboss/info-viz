ScatterChart = function (_parentElement) {
    this.parentElement = _parentElement;

    this.initVis();
};

ScatterChart.prototype.initVis = function () {
    var vis = this;

    vis.margin = { top: 0, right: 0, bottom: 10, left: 40 };
    vis.width = 500 - vis.margin.right - vis.margin.left;
    vis.height = 380 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "-45 -45 580 450")
        .classed("svg-content-responsive", true)
        .append('g')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    vis.t = function () { return d3.transition().duration(1000); }

    vis.color = d3.scaleThreshold()
        .domain([5, 9, 12, 14])
        .range(["#edf8fb", "#b3cde3", "#8c96c6", "#88419d"]);

    vis.header = vis.svg
        .append('g')
        .attr('class', 'scatter-header')
        .attr('transform', `translate(0,${-vis.margin.top * 0.6})`)
        .append('text');

    vis.header.append('tspan').text('Explore and Find')
        .attr('dy', '1em')
        .attr('dx', '1em')
        .style('font-size', '14px')
        .style('fill', 'white');

    vis.xScale = d3
        .scaleLinear()
        .range([0, vis.width]);

    vis.yScale = d3
        .scaleLinear()
        .range([vis.height, 0]);

    vis.xAxisGroup = vis.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.yAxisGroup = vis.svg.append("g")
        .attr("class", "y axis");

    //X label    
    vis.xLabel = vis.svg.append("text")
        .attr("y", vis.height + 33)
        .attr("x", vis.width / 2)
        .attr("font-size", "12px")
        .attr("text-anchor", "middle")
        .style('fill', 'white')
        .text("Complexity")

    //y label    
    vis.yLabel = vis.svg.append("text")
        .attr("y", -60)
        .attr("x", -(vis.height / 2))
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style('fill', 'white')
        .text("Average Rating")

    vis.circles = vis.svg.append('g')
        .attr('class', 'scatter-points');


    vis.svg.append("circle").attr("cx", 390).attr("cy", -28).attr("r", 4).style("fill", "#edf8fb")
    vis.svg.append("circle").attr("cx", 390).attr("cy", -14).attr("r", 4).style("fill", "#b3cde3")
    vis.svg.append("circle").attr("cx", 390).attr("cy", -1).attr("r", 4).style("fill", "#8c96c6")
    vis.svg.append("circle").attr("cx", 390).attr("cy", 12).attr("r", 4).style("fill", "#88419d")
    vis.svg.append("text").attr("x", 410).attr("y", -28).text("0-5 years").style("font-size", "12px").style('fill','white').attr("alignment-baseline", "middle");
    vis.svg.append("text").attr("x", 410).attr("y", -14).text("5-9 years").style("font-size", "12px").style('fill','white').attr("alignment-baseline", "middle");
    vis.svg.append("text").attr("x", 410).attr("y", -1).text("12-14 years").style("font-size", "12px").style('fill','white').attr("alignment-baseline", "middle");
    vis.svg.append("text").attr("x", 410).attr("y", 12).text(">14 years").style("font-size", "12px").style('fill','white').attr("alignment-baseline", "middle")

    vis.wrangleData();
};

ScatterChart.prototype.wrangleData = function () {
    var vis = this;

    vis.yVariable = d3.select('#var-selecty')
        .property('value');

    vis.xVariable = d3.select('#var-selectx')
        .property('value');

    vis.minValue = minvalue;
    vis.maxValue = maxvalue;

    vis.mechs_cat = d3.select('#mechs_cat')
    .property('value');

    vis.dataFiltered = filteredData.filter(function (d) {
        return ((d.year >= vis.minValue) && (d.year <= vis.maxValue))
    })

    console.log(selectedClickedCat);
    console.log(selectedClickedMechs);

    if(selectedClickedMechs.size!=0 && selectedClickedCat.size===0){
        vis.dataFiltered = vis.dataFiltered.filter(function(d){
            return selectedClickedMechs.has(String(d["top_mechanic_idx"]));
        }) 
    }else if(selectedClickedMechs.size===0 && selectedClickedCat.size!=0){
        vis.dataFiltered = vis.dataFiltered.filter(function(d){
            return selectedClickedCat.has(String(d["top_category_idx"]));
        })
    }else if(selectedClickedMechs.size!=0 && selectedClickedCat.size!=0){
        vis.dataFiltered = vis.dataFiltered.filter(function(d){
            return selectedClickedCat.has(String(d["top_category_idx"])) && selectedClickedMechs.has(String(d["top_mechanic_idx"])) ;
        })
        }


    vis.svg.selectAll(".brush").remove();
    vis.svg.selectAll(".scatter")
        .style('fill', d => vis.color(d.age))
        .style('fill-opacity', 0.6);

    updateSelected(vis.dataFiltered);

    vis.updateVis();
};


function mouseover() {
    const selectedID = d3.select(this).data()[0].rank;
    d3.selectAll('.scatter')
        .filter(d => d.rank === selectedID)
        .transition()
        .attr('r', 16);
}

function mouseout() {
    const selectedID = d3.select(this).data()[0].rank;
    d3.selectAll('.scatter')
        .filter(d => d.rank === selectedID)
        .transition()
        .attr('r', 3)
     
}

function updateSelected(data) {
    var vis = this;
    var mechanic = {
        0: 'Campaign / Battle Card Driven',
        1: 'Cooperative Play', 2: 'Grid Movement', 3: 'Hand Management', 4: 'Modular Board', 5: 'Role Playing', 6: 'Simultaneous Action Selection', 7: 'Storytelling', 8: 'Variable Player Powers', 9: 'Action Point Allowance System', 10: 'Point to Point Movement', 11: 'Set Collection', 12: 'Trading', 13: 'Auction/Bidding', 14: 'Card Drafting', 15: 'Take That', 16: 'Tile Placement', 17: 'Area Control / Area Influence', 18: 'Dice Rolling', 19: 'Area Movement', 20: 'Partnerships', 21: 'Route/Network Building', 22: 'Deck / Pool Building', 23: 'Variable Phase Order', 24: 'Area-Impulse', 25: 'Voting', 26: 'Action / Movement Programming', 27: 'Worker Placement', 28: 'Area Enclosure', 29: 'Memory', 30: 'Pattern Building', 31: 'Press Your Luck', 32: 'Pick-up and Deliver', 33: 'Player Elimination', 34: 'Secret Unit Deployment', 35: 'Commodity Speculation', 36: 'Time Track', 37: 'Stock Holding', 38: 'Hex-and-Counter', 39: 'Line Drawing', 40: 'Simulation', 41: 'Betting/Wagering', 42: 'Trick-taking', 43: 'Roll / Spin and Move', 44: 'Pattern Recognition', 45: 'Rock-Paper-Scissors', 46: 'Paper-and-Pencil', 47: 'Acting', 48: 'none'
    };

    var category = {
        0: 'Adventure', 1: 'Exploration', 2: 'Fantasy', 3: 'Fighting', 4: 'Miniatures', 5: 'Environmental', 6: 'Medical', 7: 'Card Game', 8: 'Civilization', 9: 'Economic', 10: 'Industry / Manufacturing', 11: 'Science Fiction', 12: 'Space Exploration', 13: 'Territory Building', 14: 'Modern Warfare', 15: 'Political', 16: 'Wargame', 17: 'Movies / TV / Radio theme', 18: 'American West', 19: 'Animals', 20: 'Negotiation', 21: 'Novel-based', 22: 'Dice', 23: 'Medieval', 24: 'Ancient', 25: 'City Building', 26: 'Age of Reason', 27: 'Mythology', 28: 'Renaissance', 29: 'Farming', 30: 'Collectible Components', 31: 'Horror', 32: 'Nautical', 33: 'Transportation', 34: 'Murder/Mystery', 35: 'Puzzle', 36: 'Religious', 37: 'Travel', 38: 'Video Game Theme', 39: 'Mature / Adult', 40: 'Abstract Strategy', 41: 'Bluffing', 42: 'Prehistoric', 43: 'Arabian', 44: 'Deduction', 45: 'Party Game', 46: 'Spies/Secret Agents', 47: 'Word Game', 48: 'Post-Napoleonic', 49: 'Trains', 50: 'Aviation / Flight', 51: 'Zombies', 52: 'Action / Dexterity', 53: 'Real-time', 54: 'World War II', 55: 'World War I', 56: 'Comic Book / Strip', 57: 'Civil War', 58: 'none', 59: 'Humor', 60: 'Racing', 61: 'Electronic', 62: 'Print & Play', 63: 'Book', 64: 'Maze', 65: 'Pirates', 66: 'Expansion for Base-game', 67: 'Sports', 68: 'Educational', 69: 'American Indian Wars', 70: 'American Revolutionary War', 71: 'Memory', 72: 'Napoleonic', 73: 'Game System', 74: 'Mafia', 75: "Children's Game", 76: 'American Civil War', 77: 'Vietnam War', 78: 'Pike and Shot', 79: 'Trivia', 80: 'Number', 81: 'Math'
    };

    d3.select('.selected-body')
        .selectAll('.selected-element')
        .data(data, d => d.rank)
        .join(
            enter =>
                enter
                    .append('p')
                    .attr('class', 'selected-element')
                    .html(
                        d =>
                            "<div class='container'>"
                            + "<div class='row'>"
                            + "<div class='col-2 auto'>"
                            + "<img src='" + d.thumb_url + "'class='img-fluid' alt=''>"
                            + "</div>"
                            + "<div class='col-2 auto'>"
                            + "<div>"
                            + "<h2 class='card-title'>" + d.names + ", " + d.year + "</h2>"
                            + "<p class='card-text'>Category: " + category[d.top_category_idx] + "</p>"
                            + "<p class='card-text'>Mechanics: " + mechanic[d.top_mechanic_idx]+ "</p>"
                            + "<p class='card-text'>Avg_time: " + d.avg_time + " minutes" + "</p>"
                            + "<p class='card-text'>Min Players: " + d.min_players + " | Max Players: " + d.max_players + "</p>"
                            + "<p class='card-text'>Publisher: " + d.publisher + "</p>"
                            + "</div>"
                            + "</div>"
                            + "</div>"
                            + "</div>"
                    )
                    .on('mouseover', mouseover)
                    .on('mouseout', mouseout)
        );
}

function highlightSelected(data) {
    const selectedIDs = data.map(d => d.rank);
    d3.selectAll('.scatter')
        .filter(d => selectedIDs.includes(d.rank))


    d3.selectAll('.scatter')
        .filter(d => !selectedIDs.includes(d.rank));
}

ScatterChart.prototype.updateVis = function () {
    var vis = this;


    vis.xExtent = d3
        .extent(vis.dataFiltered, d => d[vis.xVariable])
        .map((d, i) => (i == 0 ? d * 0.95 : d * 1.05));

    vis.yExtent = d3
        .extent(vis.dataFiltered, d => d[vis.yVariable])
        .map((d, i) => (i == 0 ? d * 0.95 : d * 1.05));


    vis.xScale.domain(vis.xExtent)
    vis.yScale.domain(vis.yExtent)


    vis.xAxis = d3.axisBottom(vis.xScale);

    vis.xAxisGroup.transition(vis.t).call(vis.xAxis);

    //Y axis
    vis.yAxis = d3.axisLeft(vis.yScale);

    vis.yAxisGroup.transition(vis.t).call(vis.yAxis);

    vis.svg.append('g').attr('class', 'brush').call(d3.brush().extent([[0, 0], [vis.width, vis.height]]).on("brush end", brushed))
    function brushed() {
        if (d3.event.selection) {
            const [[x0, y0], [x1, y1]] = d3.event.selection;
            const selected = vis.dataFiltered.filter(
                d =>
                    x0 <= vis.xScale(d[vis.xVariable]) &&
                    vis.xScale(d[vis.xVariable]) < x1 &&
                    y0 <= vis.yScale(d[vis.yVariable]) &&
                    vis.yScale(d[vis.yVariable]) < y1
            );
            updateSelected(selected);
            highlightSelected(selected);
        } else {
            updateSelected(vis.dataFiltered);
            highlightSelected([]);
        }
    }

    vis.circles
        .selectAll('.scatter')
        .data(vis.dataFiltered)
        .join(
            enter => enter
                .append('circle')
                .attr('class', 'scatter')
                .attr('cx', d => vis.xScale(d[vis.xVariable]))
                .attr('cy', d => vis.yScale(d[vis.yVariable]))
                .attr('r', 3)
                .style('fill', d => vis.color(d.age))
                .style('fill-opacity', 0.6),
            update => update
                .transition()
                .duration(700)
                .style('fill', d => vis.color(d.age))
                .style('fill-opacity', 0.6) 
                .ease(d3.easeCircle)
                .attr("cx", function (d) {
                    return vis.xScale(d[vis.xVariable]);
                })
                .attr("cy", function (d) {
                    return vis.yScale(d[vis.yVariable]);
                })
                .on("end", function () {

                }),
            exit => exit
                .transition()
                .duration(500)
                .style('opacity', 1e-6)
                .remove()
        )

    switch (vis.yVariable) {
        case 'avg_rating': vis.newyLabel = "Average Rating"; break;
        case 'geek_rating': vis.newyLabel = "Geek Rating"; break;
        case 'num_fans': vis.newyLabel = "Number of fans"; break;
        case 'weight': vis.newyLabel = "Complexity"; break;
        case 'owned': vis.newyLabel = "Owned"; break;
        default: ''
    }

    switch (vis.xVariable) {
        case 'weight': vis.newxLabel = "Complexity"; break;
        case 'owned': vis.newxLabel = "Owned"; break;
        case 'avg_rating': vis.newxLabel = "Average Rating"; break;
        case 'geek_rating': vis.newxLabel = "Geek Rating"; break;
        case 'num_fans': vis.newxLabel = "Number of fans"; break;
        default: ''
    }


    vis.yLabel.text(vis.newyLabel)
    vis.xLabel.text(vis.newxLabel)

}


