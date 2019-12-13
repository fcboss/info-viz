BubbleChart = function (_parentElement) {
    this.parentElement = _parentElement;

    this.initVis();
};

BubbleChart.prototype.initVis = function () {
    var vis = this;
    vis.mechanics = {
        0: 'Campaign / Battle Card Driven',
        1: 'Cooperative Play', 2: 'Grid Movement', 3: 'Hand Management', 4: 'Modular Board', 5: 'Role Playing', 6: 'Simultaneous Action Selection', 7: 'Storytelling', 8: 'Variable Player Powers', 9: 'Action Point Allowance System', 10: 'Point to Point Movement', 11: 'Set Collection', 12: 'Trading', 13: 'Auction/Bidding', 14: 'Card Drafting', 15: 'Take That', 16: 'Tile Placement', 17: 'Area Control / Area Influence', 18: 'Dice Rolling', 19: 'Area Movement', 20: 'Partnerships', 21: 'Route/Network Building', 22: 'Deck / Pool Building', 23: 'Variable Phase Order', 24: 'Area-Impulse', 25: 'Voting', 26: 'Action / Movement Programming', 27: 'Worker Placement', 28: 'Area Enclosure', 29: 'Memory', 30: 'Pattern Building', 31: 'Press Your Luck', 32: 'Pick-up and Deliver', 33: 'Player Elimination', 34: 'Secret Unit Deployment', 35: 'Commodity Speculation', 36: 'Time Track', 37: 'Stock Holding', 38: 'Hex-and-Counter', 39: 'Line Drawing', 40: 'Simulation', 41: 'Betting/Wagering', 42: 'Trick-taking', 43: 'Roll / Spin and Move', 44: 'Pattern Recognition', 45: 'Rock-Paper-Scissors', 46: 'Paper-and-Pencil', 47: 'Acting', 48: 'none'
    };

    vis.categories = {
        0: 'Adventure', 1: 'Exploration', 2: 'Fantasy', 3: 'Fighting', 4: 'Miniatures', 5: 'Environmental', 6: 'Medical', 7: 'Card Game', 8: 'Civilization', 9: 'Economic', 10: 'Industry / Manufacturing', 11: 'Science Fiction', 12: 'Space Exploration', 13: 'Territory Building', 14: 'Modern Warfare', 15: 'Political', 16: 'Wargame', 17: 'Movies / TV / Radio theme', 18: 'American West', 19: 'Animals', 20: 'Negotiation', 21: 'Novel-based', 22: 'Dice', 23: 'Medieval', 24: 'Ancient', 25: 'City Building', 26: 'Age of Reason', 27: 'Mythology', 28: 'Renaissance', 29: 'Farming', 30: 'Collectible Components', 31: 'Horror', 32: 'Nautical', 33: 'Transportation', 34: 'Murder/Mystery', 35: 'Puzzle', 36: 'Religious', 37: 'Travel', 38: 'Video Game Theme', 39: 'Mature / Adult', 40: 'Abstract Strategy', 41: 'Bluffing', 42: 'Prehistoric', 43: 'Arabian', 44: 'Deduction', 45: 'Party Game', 46: 'Spies/Secret Agents', 47: 'Word Game', 48: 'Post-Napoleonic', 49: 'Trains', 50: 'Aviation / Flight', 51: 'Zombies', 52: 'Action / Dexterity', 53: 'Real-time', 54: 'World War II', 55: 'World War I', 56: 'Comic Book / Strip', 57: 'Civil War', 58: 'none', 59: 'Humor', 60: 'Racing', 61: 'Electronic', 62: 'Print & Play', 63: 'Book', 64: 'Maze', 65: 'Pirates', 66: 'Expansion for Base-game', 67: 'Sports', 68: 'Educational', 69: 'American Indian Wars', 70: 'American Revolutionary War', 71: 'Memory', 72: 'Napoleonic', 73: 'Game System', 74: 'Mafia', 75: "Children's Game", 76: 'American Civil War', 77: 'Vietnam War', 78: 'Pike and Shot', 79: 'Trivia', 80: 'Number', 81: 'Math'
    };

    vis.width = 500;
    vis.height = 530;
    vis.color = d3.scaleOrdinal(d3.schemeSet1);
    vis.div = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    vis.svg = d3.select(vis.parentElement)
        .append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height);

    vis.simulation = d3.forceSimulation()
        .force("x", d3.forceX(vis.width / 2).strength(0.05))
        .force("y", d3.forceY(vis.height / 2).strength(0.05));


    vis.wrangleData();


};

BubbleChart.prototype.wrangleData = function () {
    var vis = this;

    vis.minValue = minvalue;
    vis.maxValue = maxvalue;
    vis.mechs_cat = d3.select('#mechs_cat')
        .property('value');

    
    
    vis.dataFiltered = filteredData.filter(function (d) {
        return ((d.year >= vis.minValue) && (d.year <= vis.maxValue))
    })

    vis.updateVis();

};


BubbleChart.prototype.updateVis = function () {
    var vis = this;

    vis.nested_data = d3.nest()
        .key(function (d) { return d[vis.mechs_cat] })
        .rollup(function (leaves) { return leaves.length; })
        .entries(vis.dataFiltered);


    vis.min = d3.min(vis.nested_data, function (d) { return d.value; }),
        vis.max = d3.max(vis.nested_data, function (d) { return d.value; }),
        vis.radiusScale = d3.scaleSqrt().domain([vis.min, vis.max]).range([20, 65]);

    vis.simulation.force("collide", d3.forceCollide(function (d) {
        return vis.radiusScale(d.value)
    }));

    vis.elem = vis.svg.selectAll("g")
        .data(vis.nested_data);

    vis.elem.exit()
        .transition()
        .duration(500)
        .style('opacity', 1e-6)
        .remove()

    //new
    vis.newsGroup = vis.elem.enter();
    vis.newsGroup = vis.newsGroup.append('g')
        .attr('class', 'node')
        .attr("transform", "translate(30,0)");
    vis.newsGroup.append('circle');
    vis.newsGroup.append('text')
    vis.newsGroup.append('text').attr('id',"count")


    vis.elem = vis.newsGroup.merge(vis.elem)
    vis.elem.select('circle')
        .attr("id", "data")
        .attr("class", function (d) {
            return d.key;
        })
        .attr("r", function (d) {
            return vis.radiusScale(d.value)
        })
        .style("fill", function (d, i) { return vis.color(i); })
        .style('cursor', 'pointer')
        .on('mouseover', d => {
            if (vis.mechs_cat == "top_mechanic_idx") {
                vis.div
                    .transition()
                    .duration(200)
                    .style('opacity', 0.9);
                vis.div
                    .html(vis.mechanics[d.key])
                    .style('left', d3.event.pageX + 'px')
                    .style('top', d3.event.pageY - 28 + 'px');
            } else {
                vis.div
                    .transition()
                    .duration(200)
                    .style('opacity', 0.9);
                vis.div
                    .html(vis.categories[d.key])
                    .style('left', d3.event.pageX + 'px')
                    .style('top', d3.event.pageY - 28 + 'px');
            }
        })
        .on('mouseout', () => {
            vis.div
                .transition()
                .duration(500)
                .style('opacity', 0);
        });
    ;

    vis.elem.select('text')
        .attr("dy", "-0.1em")
        .style("text-anchor", "middle")
        .style("font-size", function (d) {
            if (vis.mechs_cat == "top_mechanic_idx") {
                var len = vis.mechanics[d.key].substring(0, vis.radiusScale(d.value) / 5).length;
                var size = d.r / 3;
                size *= 10 / len;
                size += 1;
                return Math.round(size) + 'px';
            } else {
                var len = vis.categories[d.key].substring(0, vis.radiusScale(d.value) / 5).length;
                var size = d.r / 3;
                size *= 10 / len;
                size += 1;
                return Math.round(size) + 'px';
            }
        })
        .text(function (d) {
            if (vis.mechs_cat == "top_mechanic_idx") {
                var text = vis.mechanics[d.key].substring(0, vis.radiusScale(d.value) / 5);

                return text ;
            } else {
                var text = vis.categories[d.key].substring(0, vis.radiusScale(d.value) / 5);

                return text ;
            }

        }).exit().remove();

    
        vis.elem.select('#count')
        .attr("dy", "1.0em")
        .style("text-anchor", "middle")
        .style("font-size", function (d) {
            if (vis.mechs_cat == "top_mechanic_idx") {
                var len = vis.mechanics[d.key].substring(0, vis.radiusScale(d.value) / 5).length;
                var size = d.r / 3;
                size *= 10 / len;
                size += 1;
                return Math.round(size) + 'px';
            } else {
                var len = vis.categories[d.key].substring(0, vis.radiusScale(d.value) / 5).length;
                var size = d.r / 3;
                size *= 10 / len;
                size += 1;
                return Math.round(size) + 'px';
            }
        })
        .text(function (d) {
            if (vis.mechs_cat == "top_mechanic_idx") {
                var text = String(d.value).substring(0, vis.radiusScale(d.value) / 5);

                return text ;
            } else {
                var text = String(d.value).substring(0, vis.radiusScale(d.value) / 5);

                return text ;
            }

        }).exit().remove();


    vis.simulation.nodes(vis.nested_data)
        .on('tick', ticked);

    vis.simulation.alpha(0.8).restart();
    vis.highlightCircles();

    function ticked() {

        vis.elem
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
    }


}

BubbleChart.prototype.highlightCircles = function () {
    var vis = this;

    d3.selectAll('g.node')
        .each(function (d) {

            d3.select(this).selectAll('#data')
                .style('stroke-width', '0px');
            if (variable_chosen == "top_mechanic_idx") {
                d3.select(this).selectAll('circle')
                    .each(function (d) {
                        current = d3.select(this);
                        if(selectedClickedMechs.has(String(current.attr("class")))){
                        current.style("stroke","white")
                            .style("stroke-width","8px");
                        }
                    });

            }else if(variable_chosen=="top_category_idx"){
                d3.select(this).selectAll('circle')
                    .each(function (d) {
                        current = d3.select(this);
                        if(selectedClickedCat.has(String(current.attr("class")))){
                        current.style("stroke","white")
                            .style("stroke-width","8px");
                        }
                    });
            }
        });
}



