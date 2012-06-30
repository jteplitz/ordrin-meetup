(function(){
  var _     = require("underscore"),
     async  = require("async"),
     dwolla = require("dwolla"),
     config = require('nconf').argv().env().file({file:'./config.json'});

  var handler 

  handler = function(req, res, next){
    console.log("Dwolla Pay called");
    if( !req.session.dwolla_oauth ) {
      res.redirect("/dwolla");
      return;
    }

    var destinationId = 'ricky.robinett@gmail.com';
    var amount = 1;
    var pin = req.query.pin;
    var params = { destinationType : 'Email' };
    dwolla.send(req.session.dwolla_oauth, pin, destinationId, amount, params,  function(err, data){
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
