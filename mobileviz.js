if (!('ondevicemotion' in window)) {
    // not supported
} else {

    window.addEventListener('devicemotion', function (event) {
        devicemotion(event);
    });  
}

var adjustScale = 1;
var adjustDeltaX = 0;
var adjustDeltaY = 0;
var currentScale = null;
var currentDeltaX = null;
var currentDeltaY = null;

var myElement = document.getElementById('mainContainer');
//var myElement = $('.innerContainer')[0];
var hammer = new Hammer.Manager(myElement);
var pinch = new Hammer.Pinch();
var pan = new Hammer.Pan();
hammer.add([pinch, pan]);

hammer.on('pinch pan', function(ev){
    
    // Adjusting the current pinch/pan event properties using the previous ones set when they finished touching
    currentScale = adjustScale * ev.scale;
    currentDeltaX = adjustDeltaX + (ev.deltaX / currentScale);
    currentDeltaY = adjustDeltaY + (ev.deltaY / currentScale);

    console.log('pinching...');
    $('#debuginfo').prepend('Pinch; ' + ev.type + ' <br>');
    //zoom(currentScale, currentDeltaX, adjustDeltaY);
    zoom(currentScale, ev.center.x, ev.center.y);
});
hammer.on('pan', function(ev){
    //pan(currentDeltaX, adjustDeltaY);
    $('#debuginfo').prepend('Pan; ' + ev.type + ' <br>');
});
hammer.on('pinchmove', function(ev){
    $('#debuginfo').prepend('pinchmove!; ');
});


hammer.on("panend pinchend", function (ev) {
    // Saving the final transforms for adjustment next time the user interacts.
    adjustScale = currentScale;
    adjustDeltaX = currentDeltaX;
    adjustDeltaY = currentDeltaY;
});


// create a simple instance
// by default, it only adds horizontal recognizers
var mc = new Hammer(myElement);

// listen to events...
mc.on("panleft panright tap press", function(ev) {
    //console.log(ev.type +" gesture detected.");
    //$('#debuginfo').prepend(ev.type + ' <br>' );
    //zoom(1.2, ev.center.x, ev.center.y);
});  


var fixedWidth = 32;
var globalWidth = fixedWidth;
var realGlobalWidth = fixedWidth;
var enableRealWidthHandling = true;
var rotationBetaSinceLastApply = 0;
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

    rotationBetaSinceLastApply += rotationrateBeta;
    //if (rotationrateBeta > 0 && rotationrateBeta < 10 ||
    //    rotationrateBeta < 0 && rotationrateBeta > -10)
    //    return;
    if (rotationBetaSinceLastApply > 0 && rotationBetaSinceLastApply < 10 ||
        rotationBetaSinceLastApply < 0 && rotationBetaSinceLastApply > -10)
        return;    

    // if (!start)
    //     return;

    // if (new Date() - timestamp > 1500)
    //     $('#debuginfo').append('<hr>')

    //$('#debuginfo').append('<br />' + rotationrateBeta);

    if (rotationBetaSinceLastApply > 0)
        totalPlus += rotationBetaSinceLastApply;
    else
        totalMinus -= rotationBetaSinceLastApply;

    // negativ = rotate to right.
    var shift = rotationBetaSinceLastApply / 100;
    rotationBetaSinceLastApply = 0;
    realGlobalWidth += shift;
    if (
        enableRealWidthHandling &&
        (
            realGlobalWidth < 12 && globalWidth == 12 ||
            realGlobalWidth > fixedWidth && globalWidth == fixedWidth        
        )
    ){
        // do not shift, if rotatation was "too high" before.
        return;
    }

    globalWidth += shift;

    if (globalWidth < 12){
        globalWidth = 12;
    }
    if (globalWidth > fixedWidth){
        globalWidth = fixedWidth;
    }

    redrawChart();
    timestamp = new Date();
} 


function copyChart() {
    var bars = d3.selectAll(".bargroup").html();
    d3.selectAll("svg").append("g").attr("class", "bargroup2").html(bars);
}

function reset(){
    globalWidth = fixedWidth;
    realGlobalWidth = fixedWidth;
    donotmoveUntil = new Date().getTime() + 500;
    redrawChart();
    d3.selectAll(".innerContainer").attr("transform","");
}


function redrawChart() {
    var shift = fixedWidth-globalWidth; // width has a minimum of 5, fixedWith a value of 32; shift can be 27
    var shadowWidth = shift/3;

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
$('#resetButton').on('click', function () {
    reset();
});


function zoom(scaleFactor, zoomX, zoomY){
    //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    d3.selectAll(".innerContainer").attr("transform",
                  "translate(" + (-zoomX * (scaleFactor - 1)) + "," + (-zoomY * (scaleFactor - 1)) + ") " +
                  "scale(" + scaleFactor + ") ");
}