if (ns_proover===undefined) var ns_proover={};

ns_proover.initiateSave = function($btn){
  console.log(proof);
  $.ajax({
    url: '/proover/save/' + proofID,
    data: proof,
    type: 'POST',
    dataType: 'json',
    success: function (data) {
        $btn.button('reset');
        if(data.status){
          $("#saveProofBtn").removeClass("btn-danger");
          $("#saveProofBtn").addClass("btn-success");
          $.toaster({ settings : {timeout: 2000} });
          $.toaster({ priority : 'success',
            title : 'Server Message', message : 'Save Successful!'});
        } else {
          $.toaster({ settings : {timeout: 8000} });
          $.toaster({ priority : 'danger',
            title : 'Server Message', message : 'Save Error: ' + data.err});
          console.log(data.err);
        }
    },
    error: function (xhr, status, error) {
        $btn.button('reset');
        console.log('Error: ' + JSON.stringify(error));
    },
  });
}

ns_proover.addSaveListener = function(){
  $("#saveProofBtn").click(function(){
    var $btn = $(this);
    $btn.button('loading');
    setTimeout(function () {
        $btn.button('reset');
    }, 10000);
    ns_proover.initiateSave($btn);
  });
}
