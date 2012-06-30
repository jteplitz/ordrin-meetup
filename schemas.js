(function(){
  "use strict";

  var mongoose = require("mongoose");

  var Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId,
      Mixed    = Schema.Types.Mixed;

  var Order = new Schema({
    meetup_id: String,
    items: Mixed
  });

  var Meetup = new Schema({
    meetup_id: String,
    name: String,
    url: String,
    rid: Number
  });

  exports.Order  = mongoose.model("Order", Order);
  exports.Meetup = mongoose.model("Meetup", Meetup);
})();
