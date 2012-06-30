(function(){
  "use strict";

  var routes = {
    root  : require("./Root.js"),
    menu  : require("./Menu.js"),
    event : require("./Event.js"),
    setupEvent: require("./SetupEvent.js"),
    dwolla  : require("./Dwolla.js")
  };

  var routeList = [
    ["/",                      routes.root,           ["get"         ]],
    ["/order/:eid",            routes.menu,           ["get"         ]],
    ["/menu/:rid/event/:eid",  routes.setupEvent,     ["get",  "post"]],

    ["/event/:eid",            routes.event,          ["get"         ]],
    ["/dwolla",                routes.dwolla,         ["get"]]
  ];

  exports.list = routeList;
})();

