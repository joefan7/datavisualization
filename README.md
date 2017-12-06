
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

## Development Notes
- Application will consist of the following modules
    - Map
    - Graph
    - Algorithm

- MapBox Api
    - Access Token - pk.eyJ1Ijoiam9lZmFuIiwiYSI6ImNqYXEyNjNmcjB5Z24zM3Bmb28xMTZheXcifQ.DerF56MyqO8R5UQAhQC2XQ

- JSON Data
    - Time span 1 hour 25 minutes 48 seconds

    - Number of Samples during Time Span 5012

    - "millisecondOffset": 0 - 5148000
    
    - Possible values in each sample
        - "heartRate"
        - "cadence"
        - "power"
        - "temperature"
        - "elevation"
        - "distance"
        - "speed"
        - "positionLat"
        - "positionLong"
    
    - Values needed for application
        - power
        - millisecondOffset
        - positionLat
            - Number of samples with this value 5,002
        - positionLong
            - Number of samples with this value 5,002

    - Starting Position for Map (at 4 seconds or 4000 milisecondOffset)
        - "positionLat": 40.01488, "positionLong": -105.131


## Algorithm Notes
So this is a basic moving average algorithm with different windows. 
    - Windows are 1, 5, 10, 15, and 20 minutes
    
    - Data granularity is in seconds even though data expressed as milliseconds only one entry is not divisible by 1,000 evenly 
    
    - Window granularity
        1 = 60 seconds
        5 = 300 seconds
        10 = 600 seconds
        15 = 900 seconds
        20 = 1200 seconds
    
    - The problem can be restated to find the best performing 60, 300, 600, 900 and 1200 second spans
    - problem: the greatest offset is 5,148,000 milliseconds or 5,148 seconds. There are only 5,012 data points and out of those 5,012 datapoints only 5,009 have a power value. Which means: 
        - Missing datapoints -> calculations will be inaccurate. 
        - Array indices cannot be used to calculate averages
        - This is a nightmare for anypone with OCD
        - Assumptions
            - Power data (and GPS data) is prone to "noise" and dropouts. The use of various smoothing methods are out of scope for this exercise. 
            - Power values of zero will be counted as zero.
            - Missing data points within the window will not be counted as zero and therefore will not be considered in the average power calculation.
            - There could be duplicate best efforts
    - Logic
        - sort array of data objects by millisecondOffset
            testArr.sort(function(a,b){return parseFloat(a.seconds)- parseFloat(b.seconds);});
        - initialize all variables
            - lastWindowOffset = 0 (end point of window 60 sec, 300 sec etc...)
            - maxOffset = testArr[testArr.length - 1].seconds]
            - count = 0 (used to calculate average)
            - powerAccum = 0 (accumulate total power during window)
            - firstOffsetEstablished = false
            - firstWindowOffset = 0 (used to keep track of Window Starting Point)
            - firstWindowPower = 0 (used to keep track of Power starting point)
            - currAverage = 0
            - bestAverage = 0
            - bestAverageStartPoint = 0
            - bestAverageArray = [] (Keep track of Best Averages)
        A- evaluate currOffset
            - calculate lastWindowOffset
                - if lastWindowOffset > maxOffset (5148) algorithm is finished 
            - if power exists (even if it is zero) 
                - count++
                - powerAccum += power
                - if firstOffsetEstablished === false
                    - firstWindowOffset = currOffset
                    - firstWindowPower = power
            - if power is missing do not increment count do not increase powerAccum
        - advance to the next offset 
            - if currOffset > lastWindowOffset //all offsets for this window accounted for
                - currAverage = powerAccum/count
                - if currAverage > bestAverage  
                    - bestAverage = currAverage
                    - bestAverageStartPoint = firstWindowOffset
                    - bestAverageArray = []
                    - bestAverageArray.push([bestAverage, firstWindowOffset])
                - if currentAverage = bestAverage
                    - bestAverageArray.push([bestAverage, firstWindowOffset])
                - powerAccum -= firstWindowPower
                - firstWindowOffset++
                - firstWindowPower = firstWindowOffset.Power
                - count--
                GOTO A )forEach loops through the dataset once.

