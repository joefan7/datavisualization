mapboxgl.accessToken = 'pk.eyJ1Ijoiam9lZmFuIiwiYSI6ImNqYXEyNjNmcjB5Z24zM3Bmb28xMTZheXcifQ.DerF56MyqO8R5UQAhQC2XQ'; // Mapbox Token
// Read Workout Data
d3.json("../dat/workout-datav2.json", function (error, data) {
    if (error) return console.warn(error);

    var flatData = [];
    var filterArray = [];
    var centerFound = false;
    var coordArray = [];
    var centerVal = [];
    
    // flatten JSON data, reformat milliseconds, populate map coordinates.  
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
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v9',
            center: center,
            zoom: 11
        });
        renderGeoJsonLine(filterArray);
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
                    "line-color": "#FF0000",
                    "line-width": 8
                }
            });
        });
    }

    //------- GPS Charts
    var facts = crossfilter(flatData),
        timeDimension = facts.dimension(function (d) { return d.seconds; }),
        timeGroup = timeDimension.group(),
        powerGroup = timeDimension.group().reduceSum(function (d) { return d.power; });

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
    timeChart.on("renderlet", function (chart) {
        dc.events.trigger(function () {
            if (timeChart.filters()['0']) {
                // console.log(timeChart.filters()['0'][0]);
                // console.log(timeChart.filters()['0'][1]);
                var lowRange = timeChart.filters()['0'][0];
                var highRange = timeChart.filters()['0'][1];
                renderFilteredMap(lowRange, highRange);
            }
        });
    });

    function renderFilteredMap(low, high) {
        filterArray = [];
        var lowS = Math.floor(low);
        var highS = Math.floor(high);
        for (var i = 0; i < flatData.length; i++) { // needs refactoring 
            if (flatData[i].seconds >= lowS && flatData[i].seconds <= highS) {
                // console.log(flatData[i].seconds);
                // console.log(flatData[i].positionLong);
                // console.log(flatData[i].positionLat);
                if (flatData[i].positionLat !== undefined) {
                    filterArray.push([flatData[i].positionLong, flatData[i].positionLat]);
                }
            }
        }
        renderMapCenter(centerVal);
    };
});