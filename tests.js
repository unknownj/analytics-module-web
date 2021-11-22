var Analytics = require("./analytics.js");

var tsOffset = (new Date).getTime();

Analytics.before("*", function(a,b){
    if(!b.ts) b.ts = (new Date()).getTime();
    if(!b.tsOffset) b.tsOffset = b.ts - tsOffset;
});

/*
    Send three test events
*/
Analytics.event("TestEvent",{Page: "Page 1"});
Analytics.event("TestEvent",{Page: "Page 2"});
Analytics.event("TestEvent",{Page: "Page 3"});

/*
    Validate that if we ask for history, we get three events
*/
var actual_results = 0;
Analytics.on("TestEvent", function(){ actual_results += 1; }, true);
console.log("History correctly send: " + (actual_results === 3 ? "PASS" : "FAIL"));

/*
    Validate that subsequent events are passed to that same handler
*/
Analytics.event("TestEvent",{Page: "Page 4"});
console.log("Subsequent event sent: " + (actual_results === 4 ? "PASS" : "FAIL"));

/*
    Validate that if we return false in a before handler, the event isn't propagated
*/
Analytics.before("*", function(a,b){ if(b.Page === "Page 5") return false; })
Analytics.event("TestEvent",{Page: "Page 5"});
console.log("Suppression of targeted events: " + (actual_results === 4 ? "PASS" : "FAIL"));

/*
    Validate that if we attempt to perform a transformation on the data before
    it's passed to handlers, the handlers receive the modified data
*/
var data_swap_test = true;
Analytics.on("TestEvent", function(event_type, payload){
    if(data_swap_test){
        console.log(event_type);
        console.log(payload);
        console.log("Swapping of data before event handlers: " + (payload.Page === "Page 3" ? "PASS" : "FAIL"));
    }
}, false);
Analytics.before("*", function(a,b){ if(b.Page === "Page 6") b.Page = "Page 3"; });
Analytics.event("TestEvent",{Page: "Page 6"});
data_swap_test = false;

