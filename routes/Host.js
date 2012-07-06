(function(){
  "use strict";
  var _     = require("underscore"),
      https = require("https"),
      qs    = require("querystring");

  var handler, _dispatch,
      _handleGet, _handlePost;

  _handleGet = function(req, res, next){
    // make sure we're authed
    if (req.session.meetup_valid > new Date().getTime()){
      // get the events they're hosting
      // get all events and then filter
      var options = {
        host: "api.meetup.com",
        path: "/2/events",
        port: 443,
        method: "GET"
      };

      var data = {
        member_id: "self",
        fields: "event_hosts",
        access_token: req.session.meetup_oauth
      };
      options.path += "?" + qs.stringify(data);

      // make the request
      var meetupReq = https.request(options, function(resp){
        if (resp.statusCode != 200){
          console.log("error getting events");
          return next(resp.statusCode);
        }
        resp.setEncoding("utf8");

        var data = "";
        resp.on("data", function(chunk){
          data += chunk;
        });

        resp.on("end", function(){
          try{
            data = JSON.parse(data);
          }catch(e){
            console.log("bad JSON from meetup", data);
            return next(500);
          }
          // check if they're the host
          var events = data.results;
          var hosting = [];
          for (var i = 0; i < events.length; i++){
            for (var j = 0; j < events[i].event_hosts.length; j++){
              if (events[i].event_hosts[j].member_id === req.session.memberId){
                // user's hosting
                hosting.push(events[i]);
              }
            }
          }
          var params = {
            name: req.session.memberName,
            header: false,
            events: hosting,
            title: "Pick Event"
          };
          res.render("Event/pick", params);
        });
      });
      meetupReq.end();
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

  module.exports = handler;
})();
