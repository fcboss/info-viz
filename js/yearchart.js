YearChart = function (_parentElement) {
  this.parentElement = _parentElement;

  this.initVis();
};

YearChart.prototype.initVis = function () {
  var vis = this;

  vis.range = [1960, 2019]


  vis.w = 920
  vis.h = 180
  vis.margin = {
    top: 30,
    bottom: 70,
    left: 25,
    right: 20
  }


  vis.width = vis.w - vis.margin.left - vis.margin.right - 140;
  vis.height = vis.h - vis.margin.top - vis.margin.bottom;

  vis.x = d3.scaleLinear()
    .domain(vis.range)
    .range([0, vis.width]);


  vis.svg = d3.select(vis.parentElement).append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "-50 10 900 180");

  vis.g = vis.svg.append('g').attr('transform', `translate(${vis.margin.left}, ${vis.margin.top})`)

  vis.g.append('g').selectAll('line')
    .data(d3.range(vis.range[0], vis.range[1] + 1))
    .enter()
    .append('line')
    .attr('x1', d => vis.x(d)).attr('x2', d => vis.x(d))
    .attr('y1', 0).attr('y2', vis.height)
    .style('stroke', '#b3cde3')

  vis.labelL = vis.g.append('text')
    .attr('id', 'labelleft')
    .attr('x', 0)
    .attr('y', vis.height + 5)
    .style('fill', 'white')
    .text(vis.range[0])

  vis.labelR = vis.g.append('text')
    .attr('id', 'labelright')
    .attr('x', 0)
    .attr('y', vis.height + 5)
    .style('fill', 'white')
    .text(vis.range[1])

  vis.brush = d3.brushX()
    .extent([[0, 0], [vis.width, vis.height]])
    .on('brush', function () {
      s = d3.event.selection;

      vis.labelL.attr('x', s[0])
        .text(Math.round(vis.x.invert(s[0])))
      vis.labelR.attr('x', s[1])
        .text(Math.round(vis.x.invert(s[1])) - 1)

      vis.handle.attr("display", null).attr("transform", function (d, i) { return "translate(" + [s[i], - vis.height / 4] + ")"; });
      vis.svg.node().value = s.map(d => Math.round(vis.x.invert(d)));

    })
    .on('end', function () {
      if (!d3.event.sourceEvent) return;
      var d0 = d3.event.selection.map(vis.x.invert);
      var d1 = d0.map(Math.round)
      d3.select(this).transition().call(d3.event.target.move, d1.map(vis.x))

      let event = new Event("change");
      scattervalues.dispatchEvent(event);

    })

  vis.gBrush = vis.g.append("g")
    .attr("class", "brush")
    .call(vis.brush)

  var brushResizePath = function (d) {
    var e = +(d.type == "e"),
      x = e ? 1 : -1,
      y = vis.height / 2;
    return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) +
      "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) +
      "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
  }

  vis.handle = vis.gBrush.selectAll(".handle--custom")
    .data([{ type: "w" }, { type: "e" }])
    .enter().append("path")
    .attr("class", "handle--custom")
    .attr("stroke", "#000")
    .attr("fill", '#eee')
    .attr("cursor", "ew-resize")
    .attr("d", brushResizePath);

  vis.gBrush.selectAll(".overlay")
    .each(function (d) { d.type = "selection"; })
    .on("mousedown touchstart", brushcentered)

  function brushcentered() {
    var dx = vis.x(1) - vis.x(0),
      cx = d3.mouse(this)[0],
      x0 = cx - dx / 2,
      x1 = cx + dx / 2;
    d3.select(this.parentNode).call(vis.brush.move, x1 > vis.width ? [vis.width - dx, vis.width] : x0 < 0 ? [0, dx] : [x0, x1]);
  }

  vis.gBrush.call(vis.brush.move, vis.range.map(vis.x))

}

function findMinMax(data) {
  let min = arr[0].year, max = arr[0].year;

  for (let i = 1, len = arr.length; i < len; i++) {
    let v = arr[i].year;
    min = (v < min) ? v : min;
    max = (v > max) ? v : max;
  }

  return [min, max];
}