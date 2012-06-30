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
      }),
      https = require('https'), options,
      params;

  handler = function(req, res, next){
    console.log("Event called");
    options = {
        host : "api.meetup.com",
        port : 443,
        path : "/2/event/",
        method : 'GET'
    };

    options.path += req.params.eid + "?key=" + config.get("meetup_api_key") + "&sign=true";
    console.log(options);
    var req = https.request(options, function(resp) {
      params = {};

      if(resp.statusCode > 400) {
        res.render();
      } else {
        resp.on('data', function(d) {
          eventInfo = JSON.parse(d);
          params = _.extend({title: eventInfo.name}, eventInfo);
          var timestamp = (parseInt(eventInfo.time) + parseInt(eventInfo.utc_offset));
          var dateTime = new Date(timestamp);
          console.log(dateTime);
          var address = new ordrin.Address(eventInfo.venue.address_1, eventInfo.venue.city, eventInfo.venue.state, eventInfo.venue.zip, '7187533087');
          ordrin.restaurant.getDeliveryList(dateTime, address, function(err, data) {
            params.restaurants = data;
            //console.log(params)
            res.render("Event/index.jade", params);
          });
        });
      }
    });
    req.end();
    
    /*ordrin.restaurant.getDetails(req.params.rid, function(err, data){
      if (err){
        console.log("fuck", err);
        next(500, err);
        return;
      }
      var params = _.extend({title: data.name}, data);
      res.render("Menu/index.jade", params);
    });*/
    //res.render();
  }

  module.exports = handler;
})();
