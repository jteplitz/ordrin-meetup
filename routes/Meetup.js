(function(){
  "use strict";

  var _     = require("underscore"),
     async  = require("async"),
     Ordrin = require("ordrin-api"),
     qs     = require("querystring"),
     config = require('nconf').argv().env().file({file:'./config.json'});

  var handler, 
      https = require('https'), 
      params;

  handler = function(req, res, next){

    if( req.query.error ) {
      next(500);
      return;
    }

    if( typeof req.query.code == 'undefined' ) {
      console.log("redirecting");
      // redirect to login
      var query = {
        client_id: config.get("meetup_oauth_key"),
        response_type: "code",
        redirect_uri: config.get("server_host") + "/meetup",
        scope: "messaging"
      }
      query = qs.stringify(query);
      var login_url = "https://secure.meetup.com/oauth2/authorize?" + query;
      console.log(login_url);
      res.redirect(login_url);
      res.end();
      return;
    }


    // get access token
    var options = {
      host: "secure.meetup.com",
      port: 443,
      path: "/oauth2/access",
      method: "POST",
    }

    var data = {
      client_id: config.get("meetup_oauth_key"),
      client_secret: config.get("meetup_oauth_secret"),
      grant_type: "authorization_code",
      redirect_uri: config.get("server_host") + "/meetup",
      code: req.query.code
    };

    data = qs.stringify(data);

    var headers = {
      "Content-Type"  : "application/x-www-form-urlencoded",
      "Content-Length": data.length
    }
    options.headers = headers;

    var request = https.request(options, function(resp) {
      params = {};
      resp.setEncoding('utf8');

      if(resp.statusCode > 400) {
        //res.render();
        next(500);
      } else {
        var data = "";
        resp.on("data", function(chunk){
          data += chunk;
        });
        resp.on('end', function() {
          var userInfo = JSON.parse(data);
          console.log("got info", userInfo);
          // get the meetup id
          getMeetupId(userInfo.access_token, function(err, id, name){
            if (err){
              console.log("meetup id error", err);
              return next(500);
            }
            console.log("got id", id);
            req.session.meetup_oauth   = userInfo.access_token;
            req.session.memberId       = id;
            req.session.memberName     = name;
            req.session.meetup_refresh = userInfo.refresh_token;
            req.session.meetup_valid   = new Date().getTime() + (Number(userInfo.expires_in) * 1000);
            res.redirect('/events');
          });
        });
        resp.on("error", function(e){
          console.log("fuck", e);
        });
      }
    });
    request.write(data);
    request.end();
  }

  function getMeetupId(access_token, cb){
    var options = {
      host: "api.meetup.com",
      path: "/2/member/self?access_token=" + access_token,
      port: 443,
      method: "GET"
    };
    
    var req = https.request(options, function(res){
      var data = "";
      if (res.statusCode != 200){
        return cb(res.statusCode, null);
      }

      res.setEncoding("utf8");

      res.on("data", function(chunk){
        data += chunk;
      });

      res.on("end", function(){
        try{
          data = JSON.parse(data);
        }catch(e){
          return cb(e, null);
        }

        cb(false, data.id, data.name);
      });
    });
    req.end();
  }

  module.exports = handler;
})();
