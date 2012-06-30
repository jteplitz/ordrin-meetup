(function(){
  "use strict";

  var routes = {
    root    : require("./Root.js"),
    menu    : require("./Menu.js"),
    event   : require("./Event.js"),
    dwolla  : require("./Dwolla.js"),
    setupEvent: require("./SetupEvent"),
    pay     : require("./Pay.js")
  };

  var routeList = [
    ["/",                routes.root,           ["get"]],
    ["/order/:eid",            routes.menu,           ["get"         ]],
    ["/menu/:rid/event/:eid",  routes.setupEvent,     ["get",  "post"]],
    ["/event/:eid",      routes.event,          ["get"]],
    ["/dwolla",          routes.dwolla,         ["get"]],
    ["/pay/:eid",        routes.pay,            ["get"]]
  ];

  exports.list = routeList;
})();

