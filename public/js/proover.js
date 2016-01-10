var proof = proofModel.proofData;
$(document).ready(function(){
  console.log(proof);

  function addNewProofLine(proofLine) {
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
      <td class='text-right vert-align'><span>"+ proofLine.rule +" \
        </span></td> \
      <td class='text-right vert-align'><button class='btn btn-default' \
       type='button', id='edt_btn_" + proofLine.lineNo + "'><span class = \
       'glyphicon glyphicon-edit'></span></button><span \
       class='hidden'>"+ proofLine.lineNo +"</span></td>");
  }

  function showError(err){
    $( '#errDiv' ).removeClass( "hidden" );
    $('#errDiv').show();
    $('#errMsg').text(err);
  }

  function removeAllLabelModifiers(){
    $( '#proofStatus' ).removeClass("label-success");
    $( '#proofStatus' ).removeClass("label-warning");
    $( '#proofStatus' ).removeClass("label-danger");
  }

  $("[data-hide]").on("click", function(){
    $(this).closest("." + $(this).attr("data-hide")).hide();
  });

  $(".proof-rule").click(function() {
    $("#selectedRule").val($(this).text());
  });

  $("#lineSubmitBtn").click(function(){
    var depAssumptions = $("#depAssumptions").val();
    var formule = $("#formule").val();
    var annotation = $("#annotation").val();
    var selectedRule = $("#selectedRule").val();
    var lineNo = (parseInt($('#proofTable tr:last').find('.hidden').text())+1).toString();
    var FOLParser = require('FOLParser');
    var wffCheck = FOLParser.isWFF(formule);
    if (wffCheck.status){
      var FOLValidator = require('FOLValidator');
      var proofLine = FOLValidator.genProofLine({
        depAssumptions : depAssumptions,
        lineNo         : lineNo,
        formule        : formule,
        annotation     : annotation,
        rule           : selectedRule
      });
      if (proofLine.status===true){
        proof.proofLines.push(proofLine.proofLine);
        try{
          var v_st = FOLValidator.validateProof(proof);
          console.log(v_st);
          if (v_st.isProofValid && v_st.isPremiseMaintained && v_st.isGoalAttained){
            $("#ps_h").text("SUCCESS");
            removeAllLabelModifiers();
            $( '#proofStatus' ).addClass("label-success");
          }
          else if(v_st.isProofValid &&
            v_st.isPremiseMaintained && !v_st.isGoalAttained) {
            $("#ps_h").text("GOAL NOT ATTAINED");
            removeAllLabelModifiers();
            $( '#proofStatus' ).addClass("label-warning");
          }
          else if(!v_st.isProofValid){
            $("#ps_h").text("INVALID PROOF");
            removeAllLabelModifiers();
            $( '#proofStatus' ).addClass("label-danger");
          }
          addNewProofLine(proofLine.proofLine);
          //Update in server by ajax
          $('#newLineModal').modal('hide');
        } catch (err){
          showError(err);
        }
      } else {
        showError(proofLine.err);
      }
    } else {
      showError(wffCheck.err);
    }
  });
});