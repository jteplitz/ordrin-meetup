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

  exports.Order = mongoose.model("Order", Order);
})();
