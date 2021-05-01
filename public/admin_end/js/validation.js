/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function validateMakeForm() {
    var valid = true;
    if (!$("input[name=make]").val()) {
        $("input[name=make]").css('border', '2px solid red');
        $("input[name=make]").attr('title', 'Make is required');
        valid = false;
    }
    if (valid == true) {
        $('#AddUpdateMakeForm').submit();
    }
    return valid;
}

function validateModelForm() {
    var valid = true;
    if (!$("input[name=model]").val()) {
        $("input[name=model]").css('border', '2px solid red');
        $("input[name=model]").attr('title', 'Model is required');
        valid = false;
    }
    if (valid == true) {
        $('#AddUpdateModelForm').submit();
    }
    return valid;
}

function validateTrimForm() {
    var valid = true;
    if (!$("input[name=trim]").val()) {
        $("input[name=trim]").css('border', '2px solid red');
        $("input[name=trim]").attr('title', 'Model is required');
        valid = false;
    }
    if (valid == true) {
        $('#AddUpdateTrimForm').submit();
    }
    return valid;
}