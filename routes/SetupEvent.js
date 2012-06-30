(function(){
  "use strict";

  var _ = require("underscore");
  
  var handler, _dispatch,
      _handleGet, _handlePost;


  _handlePost   = function(req, res, next){
    var meetup = new req._schemas.Meetup({
      meetup_id: req.params.eid,
      rid      : req.params.rid
    });
    meetup.save(function(err){
      if (err){
        console.log("db error");
        return next(500);
      }else{
        console.log("Success!");
      }
    });
  }

  
  _handleGet    = function(req, res, next){
    console.log("get");
    var eid = req.params.eid;

    req._ordrin.restaurant.getDetails(req.params.rid, function(err, data){
      var params = _.extend({title: data.name, ordering: false}, data);
      res.render("Menu/index.jade", params);
    });
  }

  _dispatch = {GET: _handleGet, POST: _handlePost};
  handler = function(req, res, next){
    console.log(_dispatch, req.method);
    if (_dispatch[req.method]){
      return _dispatch[req.method](req, res, next);
    }
    next(405);
  }

  module.exports = handler;
})();
