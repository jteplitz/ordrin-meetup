(function(){
  "use strict";

  var _     = require("underscore"),
      async = require("async");

  var handler, _dispatch,
      _handleGet, _handlePost;

  _handleGet = function(req, res, next){
    async.parallel([
      function(cb){ getOrders(req._schemas, req.params.eid, cb) },
      function(cb){ getMeetup(req._schemas, req.params.eid, cb) }
    ], function(err, data){
      if (err){
        console.log("error", err);
        return next(500);
      }
      console.log(data);
      var params = {
        order: data[0].order,
        ordertotal: data[0].orderTotal,
        event_name: data[1].name,
        event_url: data[1].url,
        header: true,
        title: "Review Order"
      }
      res.render("Order/review.jade", params);
    });
  }

  function getMeetup(schemas, eventId, cb){
    schemas.Meetup.findOne({meetup_id: eventId}, function(err, meetup){
      var data = {
        name : meetup.name,
        url  : meetup.event_url
      };
      cb(null, data);
    });
  }

  function getOrders(schemas, meetupId, cb){
      var finalOrder = {}, orderTotal = 0;
    schemas.Order.find({meetup_id: meetupId}, function(err, orders){
      console.log("got orders", orders);
      if (err){
        console.log("order db err");
        return next(500);
      }

      for (var i = 0; i < orders.length; i++){
        var currentOrder = orders[i].items;
        for (var j = 0; j < currentOrder.length; j++){
          orderTotal += Number(currentOrder[j].price);
          if (typeof finalOrder[currentOrder[j].id] !== "undefined"){
            // two people ordered the same thing. Check the options, item by item
            var items = finalOrder[currentOrder[j].id];
            for (var h = 0; h < items.length; h++){
              if (items[h].options.toString() === currentOrder[j].options.toString){
                // same orer so just bump quantity
                items[h].quantity += 1;
                break;
              }
            }
            // no matches so no idenical items. Just push this into the array
            items.push(currentOrder[j]);
          }else{
            console.log("adding to final order", currentOrder[j].id);
            finalOrder[currentOrder[j].id] = [
              currentOrder[j]
            ]
          }
        }
      }
      console.log(finalOrder);
      var params = {
        order: finalOrder,
        orderTotal: orderTotal,
      };
      cb(null, params);
    });
  }

  _handlePost = function(req, res, next){
    console.log("got post", req.body);
  }

  _dispatch  = {GET: _handleGet, POST: _handlePost};
  handler    = function(req, res, next){
    if (_dispatch[req.method]){
      return _dispatch[req.method](req, res, next);
    }
    next(405);
  }

  module.exports = handler;
})();
