(function(){
  "use strict";

  var _ = require("underscore");

  var handler, _dispatch,
      _handleGet, _handlePost;

  _handleGet = function(req, res, next){
    combineOrders(req._schemas, req.params.eid, function(err, data){
      req.session.tray = data.order;
      var params = {
        orderTotal: data.orderTotal,
        event_name: req.session.eventName,
        event_url: req.session.eventUrl,
        header: true,
        address: req.session.eventAddress,
        title: "Place Order"
      };
      console.log(params);

      res.render("Order/place.jade", params);
    });
  }

  // gets and combines all orders for a meetup
  function combineOrders(schemas, meetupId, cb){
    var finalOrder = {}, orderTotal = 0;
    schemas.Order.find({meetup_id: meetupId}, function(err, orders){
      console.log("got orders", orders);
      if (err){
        console.log("order db err");
        return next(500);
      }

      for (var i = 0; i < orders.length; i++){
        var currentOrder = orders[i].items;
        for (var j = 0; j < currentOrder.length; j++){
          orderTotal += Number(currentOrder[j].price);
          if (typeof finalOrder[currentOrder[j].id] !== "undefined"){
            // two people ordered the same thing. Check the options, item by item
            var items = finalOrder[currentOrder[j].id];
            for (var h = 0; h < items.length; h++){
              if (items[h].options.toString() === currentOrder[j].options.toString){
                // same orer so just bump quantity
                items[h].quantity += 1;
                break;
              }
            }
            // no matches so no idenical items. Just push this into the array
            items.push(currentOrder[j]);
          }else{
            console.log("adding to final order", currentOrder[j].id);
            finalOrder[currentOrder[j].id] = [
              currentOrder[j]
            ]
          }
        }
      }
      console.log(finalOrder);
      var params = {
        order: finalOrder,
        orderTotal: orderTotal,
      };
      cb(null, params);
    });
  }

  _handlePost = function(req, res, next){
    // place the order and then let's go home. Looooong day :)

    try{
      var billingAddress = new req._ordrin.Address(req.body.addr, req.body.city, req.body.state, req.body.zip, 
                                                   String(req.body.phone));
      var creditCard = new req._ordrin.CreditCard(req.body.name, req.body.expiryMonth, req.body.expiryYear,
                                                  billingAddress, req.body.number, req.body.cvc)
      req.session.eventAddress.phone = billingAddress.phone;
    }catch(e){
      console.log("credit card issue", e);
      return next(400);
    }

    var tray = req.session.tray;
    console.log("tray", tray);
    var items = [];
    for (var item in tray){
      console.log(item, "item", typeof tray[item]);
      var options = [];
      for (var order in tray[item]){
        var currentItem = tray[item][order];
        console.log("current item", currentItem);
        for (var j = 0; j < currentItem.options.length; j++){
          options.push(currentItem.options[j].id);
        }
        item = new req._ordrin.TrayItem(currentItem.id, currentItem.quantity, options);
        items.push(item);
      }
    }
    var tray = new req._ordrin.Tray(items);
    console.log(req.session.time);
    var user = new req._ordrin.UserLogin(req.session.email, false);
    req._ordrin.order.placeOrder(req.session.rid, tray, 0, new Date(req.session.time), req.body.name.split(" ")[0], req.body.name.split(" ")[1],
                                 req.session.eventAddress, creditCard, user, false, function(err, data){
                                   console.log("placed order");
                                   if (err){
                                     console.log("so close", err);
                                     return next(500);
                                   }
                                   console.log("Fuck yeah", data);
                                   //response.render("Order/success.jade");
                                 });
  }

  _dispatch  = {GET: _handleGet, POST: _handlePost};
  handler    = function(req, res, next){
    if (_dispatch[req.method]){
      return _dispatch[req.method](req, res, next);
    }
    next(405);
  }

  module.exports = handler;
})();
