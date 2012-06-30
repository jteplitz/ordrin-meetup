(function(){
  "use strict";

  var currentItem = {}, order = [];

  $(document).ready(function(){
    // click listeners
    init();
    $("[data-listener]=menuItem").click(menuItemClicked);
    $("#addItem").click(addCurrentItem);
    $("#placeOrder").click(placeOrder);
  });

  function placeOrder(){
    var form = document.createElement("form");
    form.setAttribute("method", "POST");
    
    var orderElem = document.createElement("input");
    orderElem.setAttribute("name", "order");
    orderElem.setAttribute("value", JSON.stringify(order));
    form.appendChild(orderElem);

    form.submit();
  }

  function addCurrentItem(){
    // add in the options
    var options = document.getElementById("options").getElementsByClassName("option");
    for (var i = 0; i < options.length; i++){
      if (options[i].getElementsByClassName("optionCheck")[0].checked){
        currentItem.options.push($(options[i]).attr("data-moid"));
      }
    }
    
    // put in order object
    order.push(currentItem);

    // show in ui
    var itemName = $("#optionsTitle").html();
    $("#trayList").append("<li data-index=" + (order.length - 1) + "<p>" + itemName + "</p></li>");

    // hide dialog
    $("#optionsDialog").modal("hide");
  }

  function menuItemClicked(){
    var itemId = $(this).attr("data-miid");
    /*if (order[itemId]){
      currentItem = order[itemId];

      //check the option boxes
      for (var i = 0; i < currentItem.options.length; i++){
        $("[data-moid]=" + currentItem.options[i]).children(".optionCheck").checked = true;
      }
    }else{*/
    currentItem = {
      id: $(this).attr("data-miid"),
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
    $("#itemPrice").html($(this).children(".priceContainer").children(".price").html());
    $("#options").html(options);

    // show dialog
    $("#optionsDialog").modal("show");
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
