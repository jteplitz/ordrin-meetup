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
        orders: data[0].orders,
        orderTotal: data[0].orderTotal,
        event_name: data[1].name,
        event_url: data[1].url,
        eventId: req.params.eid,
        header: true,
        title: "Review Order"
      }
      req.session.eventName = data[1].name;
      req.session.eventUrl  = data[1].url;
      req.session.eventAddress = data[1].address;
  
      res.render("Order/review.jade", params);
    });
  }

  function getMeetup(schemas, eventId, cb){
    schemas.Meetup.findOne({meetup_id: eventId}, function(err, meetup){
      var data = {
        name : meetup.name,
        url  : meetup.event_url,
        address: meetup.address
      };
      cb(null, data);
    });
  }

  function getOrders(schemas, meetupId, cb){
    schemas.Order.find({meetup_id: meetupId}, function(err, orders){
      if (err){
        console.log("order db error");
        return next(500);
      }
      var orderTotal = 0;
      for (var i = 0; i < orders.length; i++){
        var currentOrder = orders[i].items;
        for (var j = 0; j < currentOrder.length; j++){
          orderTotal += Number(currentOrder[j].price);
        }
      }

      var data = {
        orders: orders,
        orderTotal: orderTotal
      };
      cb(null, data);
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
