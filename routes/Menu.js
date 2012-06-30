(function(){
  var _     = require("underscore"),
     async  = require("async"),
     Ordrin = require("ordrin-api"),
     config = require('nconf').argv().env().file({file:'./config.json'});

  var handler, 
      ordrin = Ordrin.init({
        apiKey: config.get("api-key"),
        restaurantUrl: "r-test.ordr.in",
        userUrl: "u-test.ordr.in",
        orderUrl: "o-test.ordr.in"
      })

  handler = function(req, res, next){
    console.log("called");
    ordrin.restaurant.getDetails(req.params.rid, function(err, data){
      if (err){
        console.log("fuck", err);
        next(500, err);
        return;
      }
      var params = _.extend({title: data.name}, data);
      console.log(params);
      res.render("Menu/index.jade", params);
    });
  }

  module.exports = handler;
})();
