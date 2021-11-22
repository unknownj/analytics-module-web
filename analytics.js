// var module = {};

(function (module) {

  var eventHistory = [];

  var eventHandlers = [];

  var transformations = [];

  var config = {};

  /**
   * Merges configuration items
   * @param {object} config - Contains 
   */
  var processConfig = function (remoteConfig) {
    if (typeof remoteConfig === "string") {
      try {
        remoteConfig = JSON.parse(remoteConfig);
      } catch (e) {
        throw new TypeError("Config needs to be an object or JSON parseable string")
      }
    }
    if (typeof (remoteConfig) !== "object") throw new TypeError("Config needs to be an object or JSON parseable string");

    for (var config_item in remoteConfig) {
      if (Array.isArray(config[config_item]) && Array.isArray(remoteConfig[config_item])) {
        config[config_item] = config[config_item].concat(remoteConfig[configItem]);
      } else if (typeof config[config_item] === "object" && typeof remoteConfig[config_item] === "object") {
        for(var k in remoteConfig[config_item]){
          config[config_item][k] = remoteConfig[config_item][k];
        }
      } else {
        config[config_item] = remoteConfig[config_item];
      }
    }

  };

  /**
   * Validates a criteria variable and tests it against an optional second argument
   * @param {*} criteria - Criteria pattern
   * @param {string} testValue - Test value
   * @returns 
   */
  var testCriteria = function (criteria, testValue) {
    if (typeof criteria === "function") {
      try {
        if (!testValue) return false;
        return criteria(testValue);
      } catch (e) {
        throw 'Error evaluating criteria: ' + e.message;
      }
    } else if (Array.isArray(criteria)) {
      for (var i = 0; i < criteria.length; i++) {
        if (testCriteria(criteria[i], testValue)) return true;
      }
      return false;
    } else if (typeof criteria === "string") {
      if (!testValue) {
        return false;
      } else if (criteria === "*") {
        return true;
      } else {
        return testValue === criteria;
      }
    } else {
      throw new TypeError("Unrecognised criteria type")
    }
  };

  /**
   * Receives an inbound event and triggers any qualifying handlers
   * @param {string} eventType - Type of analytics event
   * @param {object} eventPayload - Object containing event variables
   */
  var event = function (eventType, eventPayload) {

    for (var i = 0; i < transformations.length; i++) {
      if (testCriteria(transformations[i].criteria, eventType)) {
        var returnType = transformations[i].handler(eventType, eventPayload);
        if(returnType === false) return;
      }
    }

    eventHistory.push({ eventType: eventType, eventPayload: eventPayload });
    
    for (var i = 0; i < eventHandlers.length; i++) {
      if (testCriteria(eventHandlers[i].criteria, eventType)) {
        eventHandlers[i].handler(eventType, eventPayload);
      }
    }

  }

  /**
   * Extracts all events captured so far that meet criteria
   * @param {*} criteria - Criteria pattern
   * @returns {Array} Matching events
   */
  var get = function (criteria) {
    return eventHistory.filter(function (item) {
      return testCriteria(criteria, item.eventType);
    });
  };

  /**
   * Registers a handler for inbound events with given criteria
   * @param {*} criteria - Criteria pattern
   * @param {function} handler - Callback
   * @param {boolean} history - Run handler against matching history?
   * @returns {number} Index of handler in array
   */
  var on = function (criteria, handler, history) {

    if (typeof handler !== "function") throw new TypeError("Handler needs to be a function");

    // Run this as void to throw any errors relating to criteria type
    testCriteria(criteria);

    if (history) {
      try {
        get(criteria).forEach(function(a){ handler(a.eventType, a.eventPayload); });
      } catch (e) {
        throw 'Error running handler against analytics history';
      }
    }

    return eventHandlers.push({
      criteria: criteria,
      handler: handler
    });

  };

  /**
   * Registers a handler for inbound events run as a pre-processor that can suppress propagation
   * @param {*} criteria - Criteria pattern
   * @param {function} handler - Callback
   * @returns {number} Index of handler in array
   */
   var before = function (criteria, handler) {

    if (typeof handler !== "function") throw new TypeError("Handler needs to be a function");

    // Run this as void to throw any errors relating to criteria type
    testCriteria(criteria);

    return transformations.push({
      criteria: criteria,
      handler: handler
    });

  };


  module.exports = {

    event: event,

    // TODO: Write this function
    exec: function () { },

    // TODO: Write this function
    handleExec: function () { },

    on: on,

    before: before,

    get: get,

    config: processConfig

  };

})(module)