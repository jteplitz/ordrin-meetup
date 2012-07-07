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
      // get the delivery fee
      req._ordrin.restaurant.getFee(data[1].rid, data[0].orderSubtotal, data[0].tip, new Date(data[1].time), data[1].address, function(err, fee){
        if (err){
          console.lof("fee problem");
          return next(500);
        }
        data[0].orderTotal += Number(fee.fee);
        var params = {
          orders: data[0].orders,
          orderTotal: Math.floor(data[0].orderTotal * 100) / 100, // money it
          event_name: data[1].name,
          event_url: data[1].url,
          eventId: req.params.eid,
          fee: fee.fee,
          header: true,
          title: "Review Order"
        }
        req.session.eventName    = data[1].name;
        req.session.eventUrl     = data[1].url;
        req.session.eventAddress = data[1].address;
        req.session.rid          = data[1].rid;
        req.session.time         = data[1].time;
        req.session.email        = data[1].email;
        req.session.tip          = data[0].orderTip;
    
        res.render("Order/review.jade", params);
      });
    });
  }

  function getMeetup(schemas, eventId, cb){
    schemas.Meetup.findOne({meetup_id: eventId}, function(err, meetup){
      var data = {
        name : meetup.name,
        url  : meetup.event_url,
        address: meetup.address,
        rid  : meetup.rid,
        time : meetup.time,
        email : meetup.hostEmail
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
      var orderTotal = 0, orderSubtotal = 0, orderTip = 0;
      for (var i = 0; i < orders.length; i++){
        orderTotal    += Number(orders[i].totalPrice);
        orderSubtotal += Number(orders[i].price);
        orderTip      += Number(orders[i].tip);
      }
      console.log("total", orderTotal, orderSubtotal);
      var data = {
        orders: orders,
        orderTotal: orderTotal,
        orderSubtota: orderSubtotal,
        orderTip: orderTip
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
