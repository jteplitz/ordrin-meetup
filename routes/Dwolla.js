(function(){
  var _     = require("underscore"),
     async  = require("async"),
     Ordrin = require("ordrin-api"),
     config = require('nconf').argv().env().file({file:'./config.json'});

  var handler, 
      https = require('https'), options,
      params;

  handler = function(req, res, next){
    console.log("Dwolla called");
    options = {
        host : "www.dwolla.com",
        port : 443,
        path : "/oauth/v2/token",
        method : 'GET'
    };

    if( req.query.error ) {
      next(500);
      return;
    }

    if( typeof req.query.code == 'undefined' ) {
      // redirect to login
      var login_url = "https://www.dwolla.com/oauth/v2/authenticate?client_id="+encodeURIComponent(config.get("dwolla-key"))
        + "&response_type=code"
        + "&scope=send%7CAccountInfoFull"
        + "&redirect_uri=http://" + req.headers.host + "/dwolla";
      res.redirect(login_url);
      return;
    }

    options.path += "?client_id="+encodeURIComponent(config.get("dwolla-key"))
      + "&client_secret=" + encodeURIComponent(config.get("dwolla-secret"))
      + "&grant_type=authorization_code"
      + "&redirect_uri=http://" + req.headers.host + "/dwolla"
      + "&code=" + encodeURIComponent(req.query.code);

    console.log(options);
    var request = https.request(options, function(resp) {
      params = {};

      if(resp.statusCode > 400) {
        res.render();
      } else {
        resp.on('data', function(d) {
          userInfo = JSON.parse(d);
          console.log(userInfo);
          req.session.dwolla_oauth = userInfo.access_token;
          next(200);
        });
      }
    });
    request.end();
  }

  module.exports = handler;
})();
