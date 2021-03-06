if (ns_proover===undefined) var ns_proover={};

ns_proover.addProofLine = function (proofLine, updateLineNo) {
  var dispRule = proofLine.rule==="A"?"":proofLine.rule;
  if(updateLineNo===undefined){
    $('#proofTable').append('<tr class= "proof-line" \
      id="line_'+proofLine.lineNo+'"></tr>');
    ns_proover.resetaddLine();
  }
  $('#line_'+proofLine.lineNo).html(
    "<td class='vert-align'><span>"+ proofLine.depAssumptions.join(',') +" \
      </span></td> \
    <td class='vert-align'><span>("+ proofLine.lineNo +") \
      </span></td> \
    <td class='text-center vert-align'><span>"+ proofLine.formule +" \
      </span></td> \
    <td class='text-right vert-align'><span>"+ proofLine.annotationsStr.join(',') +" \
      </span></td> \
    <td class='text-right vert-align'><span>"+ dispRule +" \
      </span></td> \
    <td class='text-right vert-align'><button class='btn btn-default edt-btn' \
     type='button', id='edt_btn_" + proofLine.lineNo + "'><span class = \
     'glyphicon glyphicon-edit'></span><span \
     class='hidden hidden-lno'>"+ proofLine.lineNo +"</span></button></td>");

    $(".edt-btn").unbind();
    $(".edt-btn").click(function(){
      $('#e_errDiv').addClass( "hidden" );
      ns_proover.launchModelForLno($(this).find(".hidden-lno").text());
    });

    if(updateLineNo===undefined){
      $("#saveProofBtn").removeClass("btn-success");
      $("#saveProofBtn").addClass("btn-danger");
      $("#saveProofBtn").click();
    } else {
      $("#saveProofBtn").removeClass("btn-success");
      $("#saveProofBtn").addClass("btn-danger");
    }
    $("#depAssumptions").focus();
    ns_proover.scrollToBottom();
}

ns_proover.genProofLineForLno = function(givenLineNo, isEdit){
  if (isEdit!==true){
    var depAssumptions = $("#depAssumptions").val();
    var formule = $("#formule").val().trim().replace(/\s\s+/g, ' ');
    var annotation = $("#annotation").val();
    var selectedRule = $("#selectedRule").val();
  } else {
    var depAssumptions = $("#e_depAssumptions").val();
    var formule = $("#e_formule").val().trim().replace(/\s\s+/g, ' ');
    var annotation = $("#e_annotation").val();
    var selectedRule = $("#e_selectedRule").val();
  }
  var lineNo = givenLineNo
  var FOLParser = require('FOLParser');
  var wffCheck = FOLParser.isWFF(formule);
  if (!wffCheck.status){
    ns_proover.showError('[Parser Error]: Not a Well Formed \
      formule. ' + wffCheck.err, isEdit);
    return false;
  }
  var FOLProofLine = require('FOLProofLine');
  var proofLineContainer = FOLProofLine.genProofLine({
    depAssumptions : depAssumptions,
    lineNo         : lineNo,
    formule        : formule,
    annotation     : annotation,
    rule           : selectedRule
  });
  if (proofLineContainer.status!==true) {
    ns_proover.showError(proofLineContainer.err, isEdit);
    return false;
  }
  return proofLineContainer.proofLine;
}

ns_proover.updateUIProofStatus = function(v_st){
  if(!v_st.isPremiseMaintained) {
    $("#ps_h").text("MISSING PREMISE");
    ns_proover.removeAllLabelModifiers();
    $( '#proofStatus' ).addClass("label-info");
  } else if(!v_st.isGoalAttained) {
    $("#ps_h").text("GOAL NOT ATTAINED");
    ns_proover.removeAllLabelModifiers();
    $( '#proofStatus' ).addClass("label-warning");
  } else if(v_st.isProofValid &&
            v_st.isPremiseMaintained &&
            v_st.isGoalAttained){
    $("#ps_h").text("SUCCESS");
    ns_proover.removeAllLabelModifiers();
    $( '#proofStatus' ).addClass("label-success");
  } else {
    $("#ps_h").text("PROOF CURROPTED");
    ns_proover.removeAllLabelModifiers();
    $( '#proofStatus' ).addClass("label-default");
  }
  console.log(v_st);  
  proofModel.proofStatus = v_st;
  console.log(proofModel.proofStatus);
}

ns_proover.addNewLineListener = function(){

  $("#lineSubmitBtn").click(function(){
    var curLineNo = parseInt($('#proofTable tr:last').find('.hidden-lno').text());
    if (isNaN(curLineNo)) curLineNo = 0;
    var proofLine = ns_proover.genProofLineForLno((curLineNo+1).toString());
    if (proofLine===false) return;
    proof.proofLines.push(proofLine);
    try {
      var FOLValidator = require('FOLValidator');
      var v_st = FOLValidator.validateProof(proof);
      if(!v_st.isProofValid) {
        /*
        //Not allowing users to add proof lines that invalidate the proof.
        $("#ps_h").text("INVALID PROOF");
        removeAllLabelModifiers();
        $( '#proofStatus' ).addClass("label-danger");
        */
        proof.proofLines.splice(-1,1);
        ns_proover.showError(v_st.err);
      } else {
        ns_proover.updateUIProofStatus(v_st);
      }
      if (v_st.isProofValid) {
        ns_proover.addProofLine(proofLine);
      }
    } catch (err){
      ns_proover.showError(err);
    }
  });
}
