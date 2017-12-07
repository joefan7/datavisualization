var request;
if (window.XMLHttpRequest) {
    request = new XMLHttpRequest();
} else {
    request = new ActiveXObject("Microsoft.XMLHTTP");
}
// Read JSON file
request.open('GET', '../dat/workout-data.json');
request.onreadystatechange = function () {
    if ((request.status === 200) && (request.readyState === 4)) {
        var testObject = JSON.parse(request.responseText);
        var performanceArray = [];
        var windowArray = [];
        var effortPeriod = 0;
        var effortPeriodSeconds = 0;
        var bestEffort = 0;
        var currEffort = 0;
        var totPower = 0;
        var bestEffortMessage = "";
        var tempMessage = "";
        var iterations = [1, 5, 10, 15, 20];

        // Populate performanceArray
        for (var key in testObject.samples) {
            if (testObject.samples.hasOwnProperty(key)) {
                if (testObject.samples[key].values.power === undefined) {
                    testObject.samples[key].values.power = 0;
                }
                performanceArray.push(testObject.samples[key].values.power);
            }
        }

        for (var iLoop = 0; iLoop < iterations.length; iLoop++) {
            effortPeriod = iterations[iLoop];
            effortPeriodSeconds = iterations[iLoop] * 60;

            // Initialize windowArray and totPower    
            for (var i = 0; i < effortPeriodSeconds; i++) {
                windowArray.push(performanceArray[i]);
                totPower += performanceArray[i];
            }

            currEffort = totPower / effortPeriodSeconds;
            bestEffort = totPower / effortPeriodSeconds;
            bestEffortMessage = "The best " + effortPeriod + " minute performance is an average power of " + Math.round(bestEffort) + " watts from 1 minute to " + Math.round((effortPeriodSeconds/60)) + " minute.";

            // Find the average of each window of time 
            for (var j = effortPeriod; j < performanceArray.length; j++) {
                // This method moves the "time window" array through the data array by shifting values off the front 
                // and pushing corresponding values to the end of the "time window" and recalculating the running total power
                // This reduces the number of times we read the same data and essenctially establishes the best effort with
                // one pass through the data array
                totPower -= windowArray[0]
                windowArray.shift();
                windowArray.push(performanceArray[j]);
                totPower += windowArray[windowArray.length - 1];
                currEffort = totPower / effortPeriodSeconds;
                if (currEffort > bestEffort) {
                    bestEffort = currEffort;
                    bestEffortMessage = "The best " + effortPeriod + " minute performance is an average power of " + Math.round(bestEffort) + " watts from minute " + Math.round(((j - effortPeriodSeconds + 2)/60)) + " to minute " + Math.round(((j + 1)/60)) + ".";
                }
            }
            tempMessage = tempMessage + bestEffortMessage + "<br>";
        }
        var output = document.getElementById("output");
        output.innerHTML = tempMessage;
    }
};
request.send();