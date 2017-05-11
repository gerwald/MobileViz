if (!('ondevicemotion' in window)) {
    // not supported
} else {

    window.addEventListener('devicemotion', function (event) {
        devicemotion(event);
    });
}


var fixedWidth = 32;
var globalWidth = fixedWidth;
var start = false;
var totalPlus = 0,
    totalMinus = 0;
var timestamp = new Date();
var donotmoveUntil = undefined;

function devicemotion(event){

    var rotationrateBeta = Math.round(event.rotationRate.beta);
    var rotationrateAlpha = Math.round(event.rotationRate.alpha);

    if (!rotationrateBeta && !rotationrateAlpha)
        return;

    if (donotmoveUntil){
        if (donotmoveUntil > new Date())
            return;

        donotmoveUntil = undefined;
    }

    if (rotationrateAlpha > 100)
        reset();        

    if (rotationrateBeta > 0 && rotationrateBeta < 10 ||
        rotationrateBeta < 0 && rotationrateBeta > -10)
        return;

    // if (!start)
    //     return;

    // if (new Date() - timestamp > 1500)
    //     $('#debuginfo').append('<hr>')

    //$('#debuginfo').append('<br />' + rotationrateBeta);

    if (rotationrateBeta > 0)
        totalPlus += rotationrateBeta;
    else
        totalMinus -= rotationrateBeta;

    // negativ = rotate to right.
    globalWidth += rotationrateBeta / 100;

    if (globalWidth < 12)
        globalWidth = 12;
    if (globalWidth > fixedWidth)
        globalWidth = fixedWidth;

    redrawChart();
    timestamp = new Date();
} 


function copyChart() {
    var bars = d3.selectAll(".bargroup").html();
    d3.selectAll("svg").append("g").attr("class", "bargroup2").html(bars);
}

function reset(){
    globalWidth = fixedWidth;
    donotmoveUntil = new Date().getTime() + 1000;
    redrawChart();
}


function redrawChart() {
    var shift = fixedWidth-globalWidth; // width has a minimum of 5, fixedWith a value of 32; shift can be 27
    var shadowWidth = shift/2;

    d3.selectAll(".bar").attr("width", globalWidth);
    d3.selectAll(".barShadow")
        .attr("width", shadowWidth)
        .attr("x", function (d) {
            return x(d.letter) + fixedWidth - shadowWidth - shift;
        });
    d3.selectAll(".barTop")
        .attr("d", function(d){ 
            var posX = x(d.letter), posY = (y(d.frequency)-6);
            var path = "M" + (posX + shadowWidth) + " " + posY +" l" + (globalWidth - shadowWidth) + " 0 l-" + shadowWidth + " 6 l-" + (globalWidth - shadowWidth) + " 0 Z";
            return path;
        });

    d3.selectAll(".bar2")
        .attr("width", globalWidth)
        .attr("x", function (d) {
            return shift + x(d.letter);
        });
}

$('#testButton').on('click', function () {
    //totalPlus = 0, totalMinus = 0;
    //start = true;
    //copyChart();
    //globalWidth = 10;
    //redrawChart();    
    devicemotion({rotationRate: {beta: -1000, alpha: 0 }});
});
$('#testButton2').on('click', function () {
    //start = false;
    //$('#debuginfo').append('<hr><br />Total plus: ' + totalPlus);
    //$('#debuginfo').append('<br />Total minus: ' + totalMinus);

    devicemotion({rotationRate: {beta: 0, alpha: 500 }});
});