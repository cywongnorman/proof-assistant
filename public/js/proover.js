var proof = proofModel.proofData;
$(document).ready(function(){
  console.log(proof);

  function addNewProofLine(proofLine) {
    var dispRule = proofLine.rule==="A"?"":proofLine.rule;
    $('#proofTable').append('<tr class= "proof-line" \
      id="line_'+proofLine.lineNo+'"></tr>');
    $('#line_'+proofLine.lineNo).html(
      "<td class='vert-align'><span>"+ proofLine.depAssumptions.join(',') +" \
        </span></td> \
      <td class='vert-align'><span>("+ proofLine.lineNo +") \
        </span></td> \
      <td class='text-center text-nowrap vert-align'><span>"+ proofLine.formule +" \
        </span></td> \
      <td class='text-right vert-align'><span>"+ proofLine.annotationsStr.join(',') +" \
        </span></td> \
      <td class='text-right vert-align'><span>"+ dispRule +" \
        </span></td> \
      <td class='text-right vert-align'><button class='btn btn-default' \
       type='button', id='edt_btn_" + proofLine.lineNo + "'><span class = \
       'glyphicon glyphicon-edit'></span></button><span \
       class='hidden'>"+ proofLine.lineNo +"</span></td>");
  }

  function showError(err){
    $('#errDiv').removeClass( "hidden" );
    $('#errDiv').show();
    $('#errMsg').text(err);
  }

  function removeAllLabelModifiers(){
    $( '#proofStatus' ).removeClass("label-success");
    $( '#proofStatus' ).removeClass("label-warning");
    $( '#proofStatus' ).removeClass("label-danger");
    $( '#proofStatus' ).removeClass("label-info");
    $( '#proofStatus' ).removeClass("label-default");
  }

  function resetModal(){
    $("#depAssumptions").val("");
    $("#formule").val("");
    $("#annotation").val("");
    $("#selectedRule").val("");
    $('#errDiv').addClass( "hidden" );
  }

  $("[data-hide]").on("click", function(){
    $(this).closest("." + $(this).attr("data-hide")).hide();
  });

  $('.modal').on('shown.bs.modal', function () {
    $(this).find('input:text:visible:first').focus();
  });

  $(".proof-rule").click(function() {
    $("#selectedRule").val($(this).text());
  });

  $("#lineSubmitBtn").click(function(){
    var depAssumptions = $("#depAssumptions").val();
    var formule = $("#formule").val().trim().replace(/\s\s+/g, ' ');
    var annotation = $("#annotation").val();
    var selectedRule = $("#selectedRule").val();
    var curLineNo = parseInt($('#proofTable tr:last').find('.hidden').text());
    if (isNaN(curLineNo)) curLineNo = 0;
    var lineNo = (curLineNo+1).toString();
    var FOLParser = require('FOLParser');
    var wffCheck = FOLParser.isWFF(formule);
    if (wffCheck.status){
      var FOLValidator = require('FOLValidator');
      var proofLineContainer = FOLValidator.genProofLine({
        depAssumptions : depAssumptions,
        lineNo         : lineNo,
        formule        : formule,
        annotation     : annotation,
        rule           : selectedRule
      });
      if (proofLineContainer.status===true) {
        proof.proofLines.push(proofLineContainer.proofLine);
        try {
          var v_st = FOLValidator.validateProof(proof);
          if(!v_st.isProofValid) {
            /*
            $("#ps_h").text("INVALID PROOF");
            removeAllLabelModifiers();
            $( '#proofStatus' ).addClass("label-danger");
            */
            proof.proofLines.splice(-1,1);
            showError(v_st.err);
          } else if(!v_st.isGoalAttained) {
            $("#ps_h").text("GOAL NOT ATTAINED");
            removeAllLabelModifiers();
            $( '#proofStatus' ).addClass("label-warning");
          } else if(!v_st.isPremiseMaintained) {
            $("#ps_h").text("MISSING PREMISE");
            removeAllLabelModifiers();
            $( '#proofStatus' ).addClass("label-info");
          } else if(v_st.isProofValid &&
                    v_st.isPremiseMaintained &&
                    v_st.isGoalAttained){
            $("#ps_h").text("SUCCESS");
            removeAllLabelModifiers();
            $( '#proofStatus' ).addClass("label-success");
          } else {
            $("#ps_h").text("PROOF CURROPTED");
            removeAllLabelModifiers();
            $( '#proofStatus' ).addClass("label-default");
          }
          if (v_st.isProofValid) {
            addNewProofLine(proofLineContainer.proofLine);
            //TODO: Update in server by ajax
            resetModal();
            $('#newLineModal').modal('hide');
          }
        } catch (err){
          showError(err);
        }
      } else {
        showError(proofLineContainer.err);
      }
    } else {
      showError(wffCheck.err);
    }
  });
});
