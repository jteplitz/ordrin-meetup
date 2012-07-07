(function(){
  var handler;

  handler = function(req, res, next){
    console.log("loading index");
    res.render("index.jade", {title: "Home", header: false}, function(err){
      console.log("rendered", err);
    });
  }

  module.exports = handler;
})();
