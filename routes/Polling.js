(function(){
  "use strict";
  var https     = require("https"),
      sendgrid  = require("sendgrid").SendGrid,
      _         = require("underscore"),
      websocket = require("websocket").client,
      async     = require("async"),
      qs        = require("querystring"),
      oauth     = require("./oauthUtils"),
      config    = require('nconf').argv().env().file({file:'./config.json'});

  var eids = [], schemas;

  var host = config.get("server_host");

  sendgrid = new sendgrid(config.get("sendgrid_user"), config.get("sendgrid_pass"));
  
  exports.Start = function(schemas){
    async.parallel([
      startPolling,
      function(cb){ getMeetups(schemas, cb) }
    ]);
  };

  function getMeetups(appSchemas, cb){
    schemas = appSchemas;
    schemas.Meetup.find({time: {$gt: new Date().getTime()}}, function(err, meetups){
      for (var i = 0; i < meetups.length; i++){
        eids.push(meetups[i].meetup_id);
      }
      console.log("starting", eids);
      cb();
    });
  }

  function startPolling(cb){
    console.log("start");
    var client = new websocket();
    client.on("connect", function(connection){
      connection.on("error", function(err){
        console.log("fuck", err);
      });
      connection.on("message", function(message){
        var d = JSON.parse(message.utf8Data);
        if (_.include(eids, d.event.event_id)){
          console.log("included");
          if (d.response == "yes"){
            var eventId = d.event.event_id;
            var memberId = d.member.member_id;
            console.log("somebody rsvpd yes");

            // awesome message them the link

            // make sure we can oauth
            schemas.Meetup.findOne({meetup_id: d.event.event_id}, function(err, meetup){
              if (err){
                console.log("bad meetup id");
                return;
              }

              var message = "Hey " + d.member.member_name + ". We're ordring food for " + meetup.name + 
                            " through Chow Down. If you want to place an order go to " 
                            + config.get("server_host") + "/order/" + meetup.meetup_id;
                             
              
              if (new Date().getTime() > meetup.host_oauth_expire){
                // token expired
                oauth.refreshToken(meetup.host_oauth_refresh, function(err, data){
                  if (err){
                    return console.log("error refreshing token", err);
                  }

                  meetup.host_oauth_token = data.access_token;
                  meetup.host_refresh_token = data.refresh_token;
                  meetup.host_oauth_expires = new Date().getTime() + (Number(data.expires) * 1000);
                  sendMessage(message, data.access_token, memberId);
                });
              } else {
                sendMessage(message, meetup.host_oauth_token, memberId);
              }
            });
            /*var options = {
              host: "api.meetup.com",
              method: "GET",
              port: 443,
              path: "/2/member/" + d.member.member_id
            };
            options.path += "?key=" + config.get("meetup_api_key") + "&sign=true";
            var meetupReq = https.request(options, function(resp){
              console.log(resp.statusCode);
              resp.setEncoding('utf8');
              var d = "";
              resp.on("data", function(chunk){
                console.log("got chunk", chunk);
                if (typeof chunk === "undefined"){
                  console.log("wtf?");
                  return;
                }
                d += chunk;
              });
              resp.on("end", function(){
                console.log("end", d, typeof d);
                var data = JSON.parse(d);
                console.log("got user, sending email to", data.email);
                sendgrid.send({
                  to: data.email,
                  //to: "jteplitz602@gmail.com",
                  from: "meetup@ordrin.com",
                  subject: "Do you want food with that?",
                  html: "<p>Order food for your meetup. <a href=\"" + host + "/order/" + eventId + "\">Click here</a></p>"
                }, function(success, msg){
                  if (!success){
                    console.log("email not sent", msg);
                  }else{
                    console.log("email sent");
                  }
                });
             });
            });
            meetupReq.end();*/
          }
        }
      });
    });
    client.connect("ws://stream.meetup.com/2/rsvps");
    cb();
  }

  function sendMessage(message, token, memberId){
    var options = {
      host: "api.meetup.com",
      port: 443,
      method: "POST",
      path: "/2/message"
    };

    var data = {
      member_id: memberId,
      access_token: token,
      subject: "We're getting food for the meetup",
      message: message,
      cc_sender: false
    };
    data = qs.stringify(data);

    var headers = {
      "Content-Type"  : "application/x-www-form-urlencoded",
      "Content-Length": data.length
    }
    options.headers = headers;

    
    var req = https.request(options, function(res){
      var data = "";
      res.setEncoding("utf8");

      res.on("data", function(chunk){
        data += chunk;
      });

      res.on("end", function(){
        console.log("message sent", data, res.statusCode);
      });
    });

    req.write(data);
    req.end();
  }

  exports.addEvent = function(eid){
    eids.push(eid);
  }
}());
