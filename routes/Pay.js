(function(){
  var _     = require("underscore"),
     async  = require("async"),
     dwolla = require("dwolla"),
     config = require('nconf').argv().env().file({file:'./config.json'});

  var handler, _dispatch,
      _handleGet, _handlePost;

  _handleGet  = function(req, res, next){
    if( !req.session.dwolla_oauth ) {
      res.redirect("/dwolla");
      return;
    }

    req._schemas.Meetup.findOne({meetup_id: req.session.eventId}, function(err, meetup){
      if (err || meetup === null){
        console.log("db badness");
        return next(500);
      }

      req._ordrin.restaurant.getFee(meetup.rid, req.session.order.price, req.session.order.tip, 
                         new Date(meetup.time), meetup.address, 
      function(err, data){
        var total = Number(req.session.order.price) + Number(req.session.order.tip) + Number(data.tax);
        total = Math.floor(total * 100) / 100;
        req.session.order.totalPrice = total;
        var params = {
          event_name: meetup.event_name,
          event_url: meetup.event_url,
          header: true,
          subtotal: req.session.order.price,
          tax:      data.tax,
          total:    total,
          tip:      req.session.order.tip,
          title: "Order confirmation"
        };

        res.render("Pay/confirm", params);
      });

    });
  }

  _handlePost = function(req, res, next){
    console.log("Dwolla Pay called");
    if( !req.session.dwolla_oauth ) {
      res.redirect("/dwolla");
      return;
    }

    // get the event info
    req._schemas.Meetup.findOne({meetup_id: req.session.eventId}, function(err, meetup){
      if (err || meetup === null){
        console.log('db error', err);
        return next(500);
      }

      var destinationId = meetup.hostEmail;
      //var amount = req.session.orderTotal; // don't want to go broke
      var amount  = 0.01;
      var pin = req.body.pin;
      var params = { destinationType : 'Email' };
      console.log("paying", req.session.dwolla_oauth, pin, destinationId, amount, config.get("dwolla-key"));
      dwolla.send(req.session.dwolla_oauth, pin, destinationId, amount, params,  function(err, data){
        if (err){
          console.log("fuck", err, data);
          /*next(500, err, data);
          return;*/
        }

        // store their order
        var order = new req._schemas.Order({
          meetup_id: meetup.meetup_id,
          items    : req.session.order.items,
          person   : req.session.order.name,
          price    : req.session.order.price,
          tip      : req.session.order.tip,
          totalPrice: req.session.order.totalPrice,
          itemsString: req.session.order.string
        });
        order.save(function(err){
          if (err){
            console.log("db order error");
            return next(500);
          }
          console.log("order saved");
          var params = {
            event_name: meetup.name,
            event_url: meetup.url,
            title: "Success",
            header: true
          };
          res.render("Pay/success", params);
          req.session.destroy(); // we're done here
        });
        console.log('sent money', data);
      });
    });
  }

  _dispatch = {GET: _handleGet, POST: _handlePost};

  handler   = function(req, res, next){
    if (_dispatch[req.method]){
      return _dispatch[req.method](req, res, next);
    }

    next(405);
  }

  module.exports = handler;
})();
