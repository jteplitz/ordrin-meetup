(function(){
  var _     = require("underscore"),
     async  = require("async"),
     Ordrin = require("ordrin-api"),
     config = require('nconf').argv().env().file({file:'./config.json'});

  var handler, _dispatch,
      _handleGet, _handlePost;

  _handleGet = function(req, res, next){
    var ordrin = req._ordrin;
    req._schemas.Meetup.findOne({meetup_id: req.params.eid}, function(err, meetup){
      if (err || typeof meetup == "undefined"){
        console.log("damn db error", err);
        return next(500);
      }
      console.log(err, req.params.eid,  meetup);

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

  _handlePost = function(req, res, next){
    try{
      var order = JSON.parse(req.body.order);
    }catch(e){
      if (e){
        console.log("Bad tray");
        return next(400);
      }
    }

    // store this here so it's there for after dwolla.
    req.session.order   = order;
    req.session.eventId = req.params.eid;

    res.redirect("/dwolla");
  }

  _dispatch = {GET: _handleGet, POST: _handlePost};
  handler = function(req, res, next){
    if (_dispatch[req.method]){
      return _dispatch[req.method](req, res, next);
    }
    next(405);
  }

  module.exports = handler;
})();
