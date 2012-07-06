(function(){
  var handler;

  handler = function(req, res, next){
    console.log("handlign");
    res.render("index", {title: "Home", header: false});
  }

  module.exports = handler;
})();
