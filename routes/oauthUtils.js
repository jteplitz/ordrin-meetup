(function(){
  "use strict";

  var https     = require("https"),
      qs        = require("querystring"),
      config    = require('nconf').argv().env().file({file:'./config.json'});

  exports.refreshToken = function(refreshToken, cb){
    var options = {
      host: "secure.meetup.com",
      port: 443,
      method: "POST",
      path: "/oauth2/access"
    };

    var data = {
      refresh_token: refreshToken,
      client_id: config.get("meetup_oauth_key"),
      client_secret: config.get("meetup_oauth_secret"),
      grant_type: "refresh_token"
    };
    data = qs.stringify(data);

    var headers = {
      "Content-Type"  : "application/x-www-form-urlencoded",
      "Content-Length": data.length
    }
    options.headers = headers;

    var meetupReq = https.request(options, function(res){
      var data = "";
      if (res.statusCode != 200){
        console.log("oauth refresh error");
        return cb(res);
      }

      res.setEncoding("utf8");

      res.on("data", function(chunk){
        data += chunk;
      });

      res.on("end", function(){
        try{
          data = JSON.parse(data);
        }catch(e){
          console.log("BAD JSON from Meetup");
        }

        cb(null, data);
      });
    });

    meetupReq.write(data),
    meetupReq.end();
  }
})();
