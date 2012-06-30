(function(){
  "use strict";

  var currentItem = {}, order = [];

  $(document).ready(function(){
    // click listeners
    init();
    $("[data-listener]=menuItem").click(menuItemClicked);
    $("#addItem").click(addCurrentItem);
    $("#placeOrder").click(placeOrder);
  //  $("#pickRestaurant").click(pickRestaurant);
  });

  function pickRestaurant(){
    var form = document.createElement("form");
    form.setAttribute("method", "POST");

    form.submit();
  }

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
        currentItem.price += Number($(options[i]).children("span.price").html());
      }
    }
    
    // put in order object
    order.push(currentItem);

    // show in ui
    var itemName = $("#optionsTitle").html();
    $("#trayList").append("<li data-index=" + (order.length - 1) + "><p class=\"itemName\">" + itemName + "</p>" + 
                          "<span class=\"price\">" + currentItem.price + "</span></li>");
    $("#trayList").append("<div class='clear'></div>");

    //unhide tray
    $("#tray").removeClass("hidden");
    // hide dialog
    $("#optionsDialog").modal("hide");
  }

  function menuItemClicked(){
    var itemId = $(this).attr("data-miid");
    var price  = Number($(this).children(".priceContainer").children(".price").html());
    /*if (order[itemId]){
      currentItem = order[itemId];

      //check the option boxes
      for (var i = 0; i < currentItem.options.length; i++){
        $("[data-moid]=" + currentItem.options[i]).children(".optionCheck").checked = true;
      }
    }else{*/
    currentItem = {
      id: $(this).attr("data-miid"),
      options: [],
      price: price
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
    $("#itemPrice").html(price);
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
