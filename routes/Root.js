(function(){
  var handler;

  handler = function(req, res, next){
    console.log("handlign");
    res.render("index", {title: "Home", header: false}, function(err){
      console.log("rendered", err);
    });
  }

  module.exports = handler;
})();
