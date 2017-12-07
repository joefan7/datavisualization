# Notes
Since the position being applied to is for the API group, I used a few data visualization APIs and frameworks in this solution.
    - MapBox https://www.mapbox.com/
    - DC.js https://github.com/dc-js/dc.js 
    - D3.js https://d3js.org/
    - Crossfilter.js http://square.github.io/crossfilter/

## Refactoring needed
    - In the end, I could not get MapBox to redraw the GEOJson line after filtering the data points on the chart above. The filtered datapoints are making it to the MapBox API however the refresh of the map does not include the new path. 
    
    - Algorithm assumes the following:
        - Data points are complete. There are no skips in time. So that each power entry corresponds to a contiguous equal slice of 1,000 milliseconds.
        - Data points are in order.
        - No smoothing algorithms were used on the power data
        - Minimal cleaning of data was done in preprocessing of data i.e missing power data was defaulted to zeros.

    - Refactoring of the algorithm would involve adding the actual offset value found in the JSON data, greatly complicating the solution by accounting for: 
        - Gaps in time
        - Missing power entries 
        - Power data smoothing

# Peaksware Javascript Code Test

Please build a single page application to visualize the workout data provided in `workout-data.json`, including a map, a graph, and an algorithm to analyze average power output.

## Algorithm
- Write the most efficient method that finds the "best" 20 minute power effort.
- "Best" is defined as highest continuous average for the given time period.

## User Interface
- Display the gps path on a Map
+ Display the power output over time on a graph, using time as the X axis
- When user selects a range of time on the graph, highlight the corresponding range on the map
- Display the 1, 5, 10, 15, and 20 minute "best" efforts

## Hints
The purpose of this test is to demonstrate your understanding of JavaScript web application patterns and best practices, efficient algorithms, and general clean coding habits. We realize this interview question can be a substantial task. To save time, do not focus too much on CSS styling, layouts, boundary use cases, etc. You are free to use whatever frameworks and libraries you like.

## Submission
Please submit your test as an emailed zip file or link to a private repo or private file sharing system. You can also provide a hosted link or it can run locally.

