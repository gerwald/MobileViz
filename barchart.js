// Source: https://bl.ocks.org/mbostock/3885304

var globaldata;
var svg = d3.select("svg"),
    margin = {
        top: 0,
        right: 0,
        bottom: 10,
        left: 0
    },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.tsv("data.tsv", function (d) {
    d.frequency = +d.frequency;
    return d;
}, function (error, data) {
    if (error) throw error;

    globaldata = data;

    x.domain(data.map(function (d) {
        return d.letter;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d.frequency;
    })]);

    var innerContainer = g.append("g").attr("class", "innerContainer");
    var barGroup2 = innerContainer.append("g").attr("class", "bargroup2");
    barGroup2.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar2")
        .attr("x", function (d) {
            return x(d.letter);
        })
        .attr("y", function (d) {
            return y(d.frequency)+100;
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            var currentHeight = height - y(d.frequency)-100;
            if (currentHeight < 0)
                currentHeight = 0;
            return currentHeight;
        })        
        .attr("data-original-x", function (d) {
            return x(d.letter);
        });

    var chartBarGroup = innerContainer.append("g").attr("class", "bargroup");
    var chartBarsGroup = chartBarGroup.selectAll(".bar").data(data).enter().append("g");
    chartBarsGroup.append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.letter);
        })
        .attr("y", function (d) {
            return y(d.frequency);
        })
        .attr("width", x.bandwidth())
        .attr("height", function (d) {
            return height - y(d.frequency);
        });
    chartBarsGroup.append("rect")
        .attr("class", "barShadow")
        .attr("x", function (d) {
            return x(d.letter) + 31;
        })
        .attr("y", function (d) {
            return y(d.frequency) - 6;
        })
        .attr("width", 1)
        .attr("height", function (d) {
            return height - y(d.frequency) + 6;
        });
    chartBarsGroup.append("path")
        .attr("class", "barTop")
        .attr("d", function(d){ 
            var posX = x(d.letter), posY = (y(d.frequency)-6);
            return "M" + posX + " " + posY +" l32 0 l0 6 l-32 0 Z";
        });
    // chartBarsGroup.append("rect")
    //     .attr("class", "barTop")
    //     //.attr("transform", "translage(45) skewX(-15)")
    //     .attr("x", function (d) {
    //         return x(d.letter);
    //     })
    //     .attr("y", function (d) {
    //         return y(d.frequency)-6;
    //     })
    //     .attr("width", x.bandwidth())
    //     .attr("height", function (d) {
    //         return 6;
    //     });



    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisTop(x));

    g.append("g")
        .attr("class", "axis axis--y")
        //.call(d3.axisRight(y).ticks(10, "%"))
        .call(d3.axisRight(y).tickValues([0.01,0.02,0.03,0.04,0.05,0.06,0.07,0.08, 0.09, 0.1]))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Frequency");
});

