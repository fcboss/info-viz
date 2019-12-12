LineChart = function (_parentElement) {
    this.parentElement = _parentElement;

    this.initVis();
};

LineChart.prototype.initVis = function () {
    var vis = this;

    vis.time_parse = d3.timeParse('%Y');
    vis.time_format = d3.timeFormat('%Y');

    vis.margin = { left: 40, right: 90, top: 30, bottom: 0 };
    vis.height = 300 - vis.margin.top - vis.margin.bottom;
    vis.width = 550 - vis.margin.left - vis.margin.right;

    vis.svg = d3.select(vis.parentElement)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "-20 -30 580 380")
    vis.g = vis.svg.append("g")
        .attr("transform", "translate(" + vis.margin.left +
            ", " + vis.margin.top + ")");

    vis.header = vis.svg
        .append('g')
        .attr('class', 'line-header')
        .attr('transform', `translate(0,${-vis.margin.top * 0.6})`)
        .append('text');

    vis.header.append('tspan').text('Nº of Board Games Evolution since 1960')
        .attr('dy', '1em')
        .attr('dx', '1em')
        .style('font-size', '14px')
        .style('fill', 'white');

    vis.t = function () { return d3.transition().duration(1000); }

    vis.bisectDate = d3.bisector(function (d) { return d.year; }).left;

    vis.linePath = vis.g.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke-width", "2px");

    vis.yLabel = vis.g.append("text")
        .attr("class", "y axisLabel")
        .attr("transform", "rotate(-90)")
        .attr("y", -33)
        .attr("x", -170)
        .attr("font-size", "12px")
        .attr("fill", 'white')
        .attr("text-anchor", "middle")
        .text("Number Of Board Games")

    vis.xLabel = vis.svg.append("text")
        .attr("y", vis.height + 65)
        .attr("x", vis.width / 2)
        .attr("font-size", "12px")
        .attr("text-anchor", "middle")
        .style('fill', 'white')
        .text("Year")

    vis.x = d3.scaleTime().range([0, vis.width]);
    vis.y = d3.scaleLinear().range([vis.height, 0]);

    vis.yAxisCall = d3.axisLeft()
    vis.xAxisCall = d3.axisBottom().tickFormat(vis.time_format);

    vis.xAxis = vis.g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + vis.height + ")");
    vis.yAxis = vis.g.append("g")
        .attr("class", "y axis");

    vis.wrangleData();


};


LineChart.prototype.wrangleData = function () {
    var vis = this;
    vis.dict = [];

    vis.yVariable = d3.select('#var-selecty')
        .property('value');

    vis.xVariable = d3.select('#var-selectx')
        .property('value');

    vis.minValue = minvalue;
    vis.maxValue = maxvalue;

    vis.dataFiltered = filteredData.filter(function (d) {
        return ((d.year >= vis.minValue) && (d.year <= vis.maxValue))
    });

    d3.nest().key(function (d) {
        return d.year;
    }).entries(vis.dataFiltered).map(function (d) {
        vis.dict.push({
            year: Number(d.key),
            value: d.values.length
        });
    });

    vis.dict = vis.dict.sort(function (a, b) {
        if (a.year > b.year) {
            return 1;
        }
        if (a.year < b.year) {
            return -1;
        }

        return 0;
    });
    vis.dataFiltered = vis.dict;
    vis.dataFiltered.forEach(function (e, i) {
        vis.dataFiltered[i].year = vis.time_parse(e.year);
    });

    vis.updateVis();
};


LineChart.prototype.updateVis = function () {
    var vis = this;




    vis.x.domain(d3.extent(vis.dataFiltered, function (d) { return d.year; }));
    vis.y.domain([d3.min(vis.dataFiltered, function (d) { return d.value; }) / 1.005,
    d3.max(vis.dataFiltered, function (d) { return d.value; }) * 1.005]);


    vis.xAxisCall.scale(vis.x);
    vis.xAxis.transition(vis.t()).call(vis.xAxisCall);
    vis.yAxisCall.scale(vis.y);
    vis.yAxis.transition(vis.t()).call(vis.yAxisCall);


    d3.select(".focus").remove();
    d3.select(".overlay").remove();

    var focus = vis.g.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", vis.height);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", vis.width)
        .attr("x2", vis.width);

    focus.append("circle")
        .attr("r", 7.5);

    focus.append("text")
        .attr("x", 15)
        .attr("y", -20)
        .attr("dy", ".31em");

    var line = d3.line()
        .x(function (d) { return vis.x(d.year); })
        .y(function (d) { return vis.y(d.value); });

    vis.g.select(".line")
        .attr("stroke", '#88419d')
        .transition(vis.t)
        .attr("d", line(vis.dataFiltered));

    vis.svg.append("rect")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
        .attr("class", "overlay")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .on("mouseover", function () { focus.style("display", null); })
        .on("mouseout", function () { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
        var x0 = vis.x.invert(d3.mouse(this)[0]),
            i = vis.bisectDate(vis.dataFiltered, x0, 1),
            d0 = vis.dataFiltered[i - 1],
            d1 = vis.dataFiltered[i],
            d = (d1 && d0) ? (x0 - d0.year > d1.year - x0 ? d1 : d0) : 0;
        //console.log(x0);
        //console.log(i);
        //console.log(d0);
        //console.log(d1);
        //console.log(d);
        focus.attr("transform", "translate(" + vis.x(d.year) + "," + vis.y(d.value) + ")");
        focus.select("text")
            .style('fill', 'white')
            .style('font-weight', '8px')
            .text(function () { return "(" + new Date(d.year.toString()).getFullYear() + ' ,' + d.value + ")"; });
        focus.select(".x-hover-line").attr("y2", vis.height - vis.y(d.value));
        focus.select(".y-hover-line").attr("x2", -vis.x(d.year));
    }

}
