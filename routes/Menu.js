(function(){
  var _     = require("underscore"),
     async  = require("async"),
     Ordrin = require("ordrin-api"),
     config = require('nconf').argv().env().file({file:'./config.json'});

  var handler;

  handler = function(req, res, next){
    var ordrin = req._ordrin;
    req._schemas.Meetup.findOne({meetup_id: req.params.eid}, function(err, meetup){
      if (err){
        console.log("damn db error", err);
        return next(500);
      }
      console.log(err,req.params.eid,  meetup);

      ordrin.restaurant.getDetails(meetup.rid, function(err, data){
        if (err && !JSON.parse(data)){
          console.log("fuck", err);
          next(500, err, data);
          return;
        }else if (typeof data === "String"){
          data = JSON.parse(data);
        }
        var params = _.extend({
          title: data.name, 
          ordering: true,
          event_url: meetup.url,
          event_name: meetup.name,
          header: true
        }, data);
        res.render("Menu/index.jade", params);
      });
    });
  }

  module.exports = handler;
})();
