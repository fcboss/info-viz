// Global variables
var scatterChart,
    yearChart,
    lineChart,
    bubbleChart,
    radialChart;
var filteredData = {};
var topData = {};
var variable_chosen="top_mechanic_idx";
var minvalue = 1960;
var maxvalue = 2018;
var selectedClickedMechs = new Set();
var selectedClickedCat = new Set();

//Event listeners
d3.selectAll("#var-selectx").on("change", function () {
    scatterChart.wrangleData();
})

d3.selectAll("#var-selecty").on("change", function () {
    scatterChart.wrangleData();
})

d3.selectAll("#mechs_cat").on("change", function () {
    variable_chosen = d3.select('#mechs_cat')
    .property('value');
    bubbleChart.wrangleData();
})

d3.selectAll('#scattervalues').on("change", function () {
    minvalue = Number(document.getElementById('labelleft').innerHTML);
    maxvalue = Number(document.getElementById('labelright').innerHTML);
    scatterChart.wrangleData();
    lineChart.wrangleData();
    bubbleChart.wrangleData();
    radialChart.wrangleData();
})

function filterDataRange(data) {
    return data.filter(d => {
        return (
            d.year > 1960 &&
            d.year <= 2018
        );
    });
}


d3.json('data//board_games_mechs_cats.json').then(res => {
    filteredData = res;

    scatterChart = new ScatterChart("#scatterchart");
    yearChart = new YearChart('#eventhandler');
    lineChart = new LineChart('#my_dataviz');
    bubbleChart = new BubbleChart('#bubble');
    radialChart = new RadialChart('#radial-struc');

    

    d3.selectAll('g.node')
        .each(function (d) {

            d3.select(this).selectAll('#data').on('click', function (d) {
                d3.select(this)
                    .style('stroke', 'white')
                    .style('stroke-width', '8px');

                if (variable_chosen == "top_mechanic_idx") {
                    selectedClickedMechs.add(d.key);
                    scatterChart.wrangleData();
                    radialChart.wrangleData();
                }
                else if (variable_chosen== "top_category_idx") {
                    selectedClickedCat.add(d.key);
                    scatterChart.wrangleData();
                    radialChart.wrangleData();
                }
        });
});

});
