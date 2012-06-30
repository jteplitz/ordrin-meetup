(function(){
  "use strict";

  var routes = {
    root : require("./Root.js"),
  };

  var routeList = [
    ["/",                routes.root,           ["get"]],
  ];

  exports.list = routeList;
})();

