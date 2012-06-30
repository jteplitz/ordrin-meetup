(function(){
  var _     = require("underscore"),
     async  = require("async"),
     dwolla = require("dwolla"),
     config = require('nconf').argv().env().file({file:'./config.json'});

  var handler 

  handler = function(req, res, next){
    console.log("DwollaInfo called");
    console.log(req.session);
    dwolla.fullAccountInfo(req.session.dwolla_oauth, function(err, data){
      if (err){
        console.log("fuck", err);
        next(500, err, data);
        return;
      }
      console.log(data);
    });
  }

  module.exports = handler;
})();
