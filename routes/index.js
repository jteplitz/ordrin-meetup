(function(){
  "use strict";

  var routes = {
    root : require("./Root.js"),
    menu : require("./Menu.js")
  };

  var routeList = [
    ["/",                routes.root,           ["get"]],
    ["/menu/:rid",       routes.menu,           ["get"]]
  ];

  exports.list = routeList;
})();

