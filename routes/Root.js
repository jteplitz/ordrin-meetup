(function(){
  var handler;

  handler = function(req, res, next){
    res.render("index", {title: "Home"});
  }

  module.exports = handler;
})();
