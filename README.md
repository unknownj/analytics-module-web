# analytics-module-web
Web Analytics Module

## Emitting analytics events

The `event` function accepts two arguments, a string `eventType` which can be used to constrain event handlers to specific types of data, and an object `eventPayload` which contains the assignment of values to properties that describe the event.

```javascript
event = function (eventType, eventPayload)
```

### Example usage

The following shows how a journey might initialise a data layer on load, using a Datalayer event type and passing a set of variable assignments in a flat object.

``` javascript
Analytics.event(
  "Datalayer",
  {
    // Brand
    // Lloyds, Halifax, BOS, MBNA
    brand: "Lloyds",

    // Channel
    // Online, Branch, Telephony
    channel: "Online",
    // channelSortcode: "309856",
    // channelUserID: "7591557",

    // Division
    // Retail, Commercial
    division: "Retail"
  }
);
```

## Receiving analytics events

The `on` function allows handlers to register themselves to receive both future events (by default) and the event history received thus far (by way of setting the optional third `history` argument to true).

The first argument, `criteria`, can be:

- A string, which specifies the event type that is being listened for, with the special case of:
- The string "`*`", which specifies that all event types should be listened for
- An Array of strings, which contain a list of qualifying event types to listen for
- A function, which must return true or false when passed the event type as its sole argument

The second argument, `handler`, must be a function which accepts two arguments - the event type and the event payload as passed into the `event` function.

```javascript
on = function (criteria, handler, history)
```

### Example usage

The following example shows how the data layer initialisation in the previous section might be processed.

```javascript
Analytics.on(
    "Datalayer",
    function(eventType,eventPayload){
        for(var k in eventPayload){
            datalayer.set(k,eventPayload[k]);
        }
    },
    true
);
```

In the next example, we might wish to maintain a list of fields with which the customer has interacted, their first interaction timestamp, and how many times they've been interacted with:

```javascript
var fields = {};

Analytics.on(
    ["UserInput","Button"],
    function(eventType,eventPayload){
        if(eventPayload.event === "blur") return;

        var nm = eventPayload.name;

        fields[nm] = fields[nm] || {
            firstInteraction: eventPayload.timestamp,
            interactionCount: 0
        };
        fields[nm].interactionCount += 1;
    },
    true
);
```

## Transforming Data

Similar to the `on` function, the `before` function allows developers to register handlers that run before data is made available to the data consumption handlers.

The purpose of these handlers is to enable transformation of data before downstream tools access the events. The `criteria` and `handler` arguments follow the same pattern as those on the `on` function, with the slight variation that if the handler explicitly returns `false` then processing of the event halts, and it is never made available to the handlers registered via the `on` function.

```javascript
before = function (criteria, handler)
```

### Example Usage

This function can be used to define specifications for event types to enforce compliance with a schema. For example:

```javascript
Analytics.before(
    "FieldUpdate",
    function(eventType, eventPayload){
        if(!eventPayload.name) return false;
        if(!eventPayload.event) return false;
    }
);
```

This simple function ensures that any Field Update events that are missing either a field name or an interaction type are not propagated to the `on` handlers.

Alternatively, the function can be used to perform simple data quality corrections, thus:

```javascript
Analytics.before(
    "Datalayer",
    function(eventType, eventPayload){
        if(eventPayload.brand.toLowerCase() === "bank of scotland"){
            eventPayload.brand = "BOS";
        }
    }
);
```

Fixing the Brand field so that if the full "Bank of Scotland" value is passed, it's adjusted to the correct "BOS" value that downstream systems expect.

*Warning:* The order of the `before` handlers should not be assumed to be fixed, and care should be taken not to use the functionality for any purposes for which a fixed order of operations is required. Where a fixed order is required, the operations should be bundled into a single handler function.

## Retrieving the event history to date

The `get` function returns an array of analytics events received thus far, constrained by the `criteria` argument in the same format as the `on` and `before` functions.

```javascript
get = function (criteria)
```

## Setting configuration items

Docs to follow..

```javascript
config = function (remoteConfig)
```
