(function(){
  "use strict";

  var mongoose = require("mongoose");

  var Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId,
      Mixed    = Schema.Types.Mixed;

  var Order = new Schema({
    meetup_id: String,
    items: Mixed,
    itemsString: String,
    person: String,
    price: Number,
    tip: Number,
    totalPrice: Number
  });

  var Meetup = new Schema({
    meetup_id: {type: String, index: {unique: true}},
    name: String,
    event_url: String,
    rid: Number,
    hostEmail: String,
    address: Mixed,
    time: Number,
    host_oauth_token: String,
    host_oauth_refresh: String,
    host_oauth_expire: Number
  });

  exports.Order  = mongoose.model("Order", Order);
  exports.Meetup = mongoose.model("Meetup", Meetup);
})();
