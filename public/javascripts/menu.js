(function(){
  "use strict";

  var currentItem = {}, order = {
    items: [],
    price: 0,
    string: ""
  };

  $(document).ready(function(){
    // click listeners
    init();
    $("[data-listener]=menuItem").click(menuItemClicked);
    $("#addItem").click(addCurrentItem);
    $("#placeOrder").click(placeOrder);
  //  $("#pickRestaurant").click(pickRestaurant);
  });

  // sets subtotal and tip
  function setSubtotal(percent){
    $("#subtotal").html(Math.floor(order.price * 100) / 100);

    var tip = order.price * percent;
    tip     = Math.floor(tip * 100) / 100;
    $("#tipBox").val(tip);
  }

  function pickRestaurant(){
    var form = document.createElement("form");
    form.setAttribute("method", "POST");

    form.submit();
  }

  function placeOrder(){
    var form = document.createElement("form");
    form.setAttribute("method", "POST");

    order.name = $("#name").val();
    order.tip  = $("#tipBox").val();
    
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
        if (currentItem.price.length > 4){
          currentItem.price = String(currentItem.price).substring(0, 3);
        }
        currentItem.price += Number($(options[i]).children("span.price").html());
      }
    }
    currentItem.price = Math.floor(currentItem.price * 100) / 100;

    order.price  += Math.floor(Number(currentItem.price) * 100) / 100;
    order.string += " 1 " + currentItem.name;
    
    // put in order object
    order.items.push(currentItem);

    // show in ui
    var itemName = $("#optionsTitle").html();
    $("#trayList").append("<li data-index=" + (order.items.length - 1) + "><p class=\"itemName\">" + itemName + " </p>" + 
                          "<span class=\"price\">" + currentItem.price + "</span></li>");
    $("#trayList").append("<div class='clear'></div>");

    //unhide tray
    $("#tray").removeClass("hidden");
    // update subtotal and tip
    setSubtotal(0.2);
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
      price: price,
      quantity: 1,
      name: $(this).children(".name").html()
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
