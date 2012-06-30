(function(){
  "use strict";

  var currentItem = {};

  $(document).ready(function(){
    // click listeners
    init();
    $("[data-listener]=menuItem").click(menuItemClicked);
    $("#addItem").click(addCurrentItem);
  });

  function addCurrentItem(){
    var options = document.getElementById("options").getElementsByClassName("option");
    for (var i = 0; i < options.length; i++){
      if (options[i].getElementsByClassName("optionCheck")[0].checked){
        currentItem.options.push($(options[i]).attr("data-moid"));
      }
    }
    console.log(currentItem);
  }

  function menuItemClicked(){
    currentItem.item = $(this).attr("data-miid");
    currentItem = {
      item: $(this).attr("data-miid"),
      options: []
    }

    var options = $(this).children(".optionCategoryList");
    options.removeClass("hidden");
    if (options.length != 0){
      console.log(options);
      options = options[0].cloneNode(true);
    }
    

    // prep dialog
    $("#optionsTitle").html($(this).children(".name").html());
    $("#itemDescription").html($(this).children(".menuItemDescription").html());
    console.log();
    $("#itemPrice").html($(this).children(".priceContainer").children(".price"));
    $("#options").html(options);

    // show dialog
    $("#optionsDialog").modal({
      show:  true
    });
    $("#optionsDialog").removeClass("hidden");
  }

  function prepDialog(options){
  }

  function init(){
    $("#optionsDialog").modal({
      backdrop: true,
      show: false,
      keyboard: true
    });
  }

})();
