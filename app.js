
/**
 * Module dependencies.
 */

var express   = require('express')
  , routes    = require('./routes')
  , _         = require("underscore")
  , mongoose  = require("mongoose")
  , schemas   = require("./schemas")
  , Ordrin    = require("ordrin-api")
  , Polling   = require("./routes/Polling.js")
  , SessionMongoose = require("session-mongoose")
  , config = require('nconf').argv().env().file({file:'./config.json'});

var app = module.exports = express.createServer();
mongoose.connect(config.get("mongo-connection"));
Polling.Start(schemas);
var ordrin = Ordrin.init({
  apiKey: config.get("api-key"),
  restaurantUrl: "r-test.ordr.in",
  userUrl: "u-test.ordr.in",
  orderUrl: "o-test.ordr.in"
});
var mongooseSessionStore = new SessionMongoose({
  url: config.get("mongo-connection"),
  interval: 120000 // expiration check worker run interval in millisec (default: 60000)
});

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ 
    secret: config.get("secret"),
    store: mongooseSessionStore
  }));
  app.use(function(req, res, next){
    req._schemas = schemas;
    req._ordrin  = ordrin;
    next();
  });
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

_.each(routes.list, function(route){
  console.log("routing", route);
  var methods = route[2] || "GET";

  methods.forEach(function(method){
    var params = [];
    app[method](route[0], params, route[1]);
  });
});

app.listen(process.env.PORT || 5000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
