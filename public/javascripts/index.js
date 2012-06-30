$(document).ready(function(){
  $("#formSubmit").click(function(){
    var eventId = $("#largeForm").val();

    document.location.href = "/event/" + eventId;
  });
});
