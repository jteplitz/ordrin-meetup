(function(){
  "use strict";

  var routes = {
    root  : require("./Root.js"),
    menu  : require("./Menu.js"),
    event : require("./Event.js")
  };

  var routeList = [
    ["/",                routes.root,           ["get"]],
    ["/menu/:rid",       routes.menu,           ["get"]],
    ["/event/:eid",      routes.event,          ["get"]]
  ];

  exports.list = routeList;
})();

