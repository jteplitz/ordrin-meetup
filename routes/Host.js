(function(){
  "use strict";
  var _     = require("underscore"),
      https = require("https");

  var handler, _dispatch,
      _handleGet, _handlePost;

  _handleGet = function(req, res, next){
    // make sure we're authed
    if (req.session.meetup_valid > new Date().getTime()){
      // get the events they're hosting
      // get all events and then filter
      var options = {
        host: 
      }
    } else {
      // we should refresh, but for now redirect TODO
      res.redirect("/meetup");
    }
  }

  _dispatch = {GET: _handleGet};
  handler   = function(req, res, next){
    if (_dispatch[req.method]){
      return _dispatch[req.method](req, res, next);
    }
  }
})();
