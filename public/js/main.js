mapboxgl.accessToken = 'pk.eyJ1Ijoiam9lZmFuIiwiYSI6ImNqYXEyNjNmcjB5Z24zM3Bmb28xMTZheXcifQ.DerF56MyqO8R5UQAhQC2XQ'; // Mapbox Token
// Read Workout Data
d3.json("../dat/workout-datav2.json", function (error, data) {
    if (error) return console.warn(error);

    // flatten JSON data, reformat milliseconds, populate map coordinates.
    var flatData = [];
    var centerFound = false;
    var coordArray = [];
    var centerVal = [];

    data.forEach(function (d) {
        flatData.push({
            seconds: Math.floor(d.millisecondOffset / 1000),
            // heartRate: d.values.heartRate,
            // cadence: d.values.cadence,
            power: d.values.power,
            // temperature: d.values.temperature,
            // elevation: d.values.elevation,
            // distance: d.values.distance,
            // speed: d.values.speed,
            positionLat: d.values.positionLat,
            positionLong: d.values.positionLong
        });
        if (d.values.positionLat !== undefined) {
            if (centerFound === false) { //first set of coordinates in JSON data
                centerVal = ([d.values.positionLong, d.values.positionLat]);
                centerFound = true;
                // renderMapCenter(centerVal);
            }
            coordArray.push([d.values.positionLong, d.values.positionLat]);
        }
    });

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        center: centerVal,
        zoom: 11
    });

    renderGeoJsonLine(coordArray);

    function renderMapCenter(center) {
        console.log("renderMapCenter Executing");
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v9',
            center: center,
            zoom: 11
        });
    }

    function renderGeoJsonLine(coordinateArray) {
        map.on('load', function () {
            map.addLayer({
                "id": "route",
                "type": "line",
                "source": {
                    "type": "geojson",
                    "data": {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "LineString",
                            "coordinates": coordinateArray
                        }
                    }
                },
                "layout": {
                    "line-join": "round",
                    "line-cap": "round"
                },
                "paint": {
                    "line-color": "#888",
                    "line-width": 8
                }
            });
        });
    }
    var facts = crossfilter(flatData),
        timeDimension = facts.dimension(function (d) { return d.seconds; }),
        timeGroup = timeDimension.group(),
        powerGroup = timeDimension.group().reduceSum(function (d) { return d.power; })
    var all = facts.groupAll();

    var minTime = timeDimension.bottom(1)[0].seconds;
    var maxTime = timeDimension.top(1)[0].seconds;

    var dataCount = dc.dataCount(".dc-data-count")
        .dimension(facts)
        .group(all)
        .html({
            some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> datapoints | <a href="javascript:dc.filterAll(); dc.redrawAll()">Reset</a>',
            all: 'All datapoints selecgted. Click on Time axis to apply filters'
        });

    var timeChart = dc.barChart("#range-chart")
        .width(1360)
        .height(100)
        .brushOn(true)
        .x(d3.scale.linear().domain([minTime, maxTime]))
        .xAxisLabel("Time in Seconds - Click and drag to filter on subset")
        .margins({ top: 0, bottom: 70, right: 10, left: 50 })
        .dimension(timeDimension)
        .group(timeGroup);

    timeChart.xAxis().ticks(30);
    timeChart.yAxis().ticks(0).outerTickSize(0);
        
    var lineChart = dc.lineChart("#chart")
        .elasticX(false)
        .width(1360)
        .height(200)
        .x(d3.scale.linear().domain([minTime, maxTime]))
        .renderArea(false)
        .brushOn(false)
        .rangeChart(timeChart)
        .renderDataPoints(true)
        .clipPadding(10)
        .yAxisLabel("Power")
        .margins({ top: 10, bottom: 30, right: 10, left: 50 })
        .dimension(timeDimension)
        .group(powerGroup)
        .renderHorizontalGridLines(true)
        ;
       
    lineChart.xAxis().ticks(30);
    lineChart.yAxis().ticks(10);
    dc.renderAll();
    dc.redrawAll();

    // rotate xAxis tich labels
    lineChart.selectAll('g.x text').attr('transform', function (d) { return 'translate(-20,10) rotate(-45)'; });
    timeChart.selectAll('g.x text').attr('transform', function (d) { return 'translate(-20,10) rotate(-45)'; });
        
    
    timeChart.on("renderlet",function(chart){
        dc.events.trigger(function() {
            console.log(timeChart.filters()["0"]);
        });
    });

});