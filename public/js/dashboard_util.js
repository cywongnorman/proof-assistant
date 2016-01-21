if(ns_dashboard===undefined) var ns_dashboard = {};

ns_dashboard.addMiscListeners = function(){

      $("[data-hide]").on("click", function(){
        $(this).closest("." + $(this).attr("data-hide")).hide();
      });

      $('.modal').on('shown.bs.modal', function () {
        $(this).find('input:text:visible:first').focus();
      });

      $("#proofName").on("input propertychange paste", function(){
        dynamicTextFormInput.call(this)
      });

      $(".proof-anchor").hover(function(){
        $(".list-group-item").removeClass("proof-active");
        $(this).parent().addClass("proof-active");
      }, function(){
        $(this).parent().removeClass("proof-active");
      });
}
