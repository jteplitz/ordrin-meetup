
/**
 * Module dependencies.
 */

var express   = require('express')
  , routes    = require('./routes')
  , _         = require("underscore")
  , mongoose  = require("mongoose")
  , schemas   = require("./schemas")
  , Ordrin    = require("ordrin-api")
  , config = require('nconf').argv().env().file({file:'./config.json'});

var app = module.exports = express.createServer();
mongoose.connect(config.get("mongo-connection"));
var ordrin = Ordrin.init({
  apiKey: config.get("api-key"),
  restaurantUrl: "r-test.ordr.in",
  userUrl: "u-test.ordr.in",
  orderUrl: "o-test.ordr.in"
});

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
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
  var methods = route[2] || "GET";

  methods.forEach(function(method){
    var params = [];
    app[method](route[0], params, route[1]);
  });
});

// Routes

app.get('/', routes.index);

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
