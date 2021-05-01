/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function validateZipCode() {
    var valid = true;
    if (!$("input[name=zipcode]").val()) {
        $("input[name=zipcode]").css('border', '2px solid red');
        $("input[name=zipcode]").attr('title', 'Zipcode is required');
        valid = false;
    } else {
        var numberRegex = /^[0-9]+$/;
        if (!numberRegex.test($('input[name=zipcode]').val())) {
            $("input[name=zipcode]").css('border', '2px solid red');
            $("input[name=zipcode]").attr('title', 'Only number allowed');
            valid = false;
        } else {
            if ($("input[name=zipcode]").val().length > 6 || $("input[name=zipcode]").val().length < 5) {
                $("input[name=zipcode]").css('border', '2px solid red');
                $("input[name=zipcode]").attr('title', 'Zipcode is not valid');
                valid = false;
            }
        }
    }
    if (valid == true) {
        $('#insuranceLandingForm').submit();
    }
    return valid;
}

function validateContactForm() {
    var valid = true;
    if (!$("input[name=product_of_interest]").val()) {
        $("input[name=product_of_interest]").parent().css('border', '2px solid red');
        $("input[name=product_of_interest]").attr('title', 'Product of interest is required');
        valid = false;
    } else {
        $("input[name=product_of_interest]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=product_of_interest]").attr('title', '');
    }
    if (!$("input[name=first_name]").val()) {
        $("input[name=first_name]").parent().css('border', '2px solid red');
        $("input[name=first_name]").attr('title', 'First name is required');
        valid = false;
    } else {
        $("input[name=first_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=first_name]").attr('title', '');
    }
    if (!$("input[name=last_name]").val()) {
        $("input[name=last_name]").parent().css('border', '2px solid red');
        $("input[name=last_name]").attr('title', 'Last name is required');
        valid = false;
    } else {
        $("input[name=last_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=last_name]").attr('title', '');
    }
    if (!$("input[name=phone_number]").val()) {
        $("input[name=phone_number]").parent().css('border', '2px solid red');
        $("input[name=phone_number]").attr('title', 'Phone number is required');
        valid = false;
    } else {
        $("input[name=phone_number]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=phone_number]").attr('title', '');
    }
    if (!$("input[id=timeList_input]").val()) {
        $("input[id=timeList_input]").parent().css('border', '2px solid red');
        $("input[id=timeList_input]").attr('title', 'Time preference is required');
        valid = false;
    } else {
        $("input[id=timeList_input]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=timeList_input]").attr('title', '');
    }
    if (!$("input[name=email]").val()) {
        $("input[name=email]").parent().css('border', '2px solid red');
        $("input[name=email]").attr('title', 'Email is required');
        valid = false;
    } else {
        email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        if (!email_regex.test($('input[name=email]').val())) {
            $("input[name=email]").parent().css('border', '2px solid red');
            $("input[name=email]").attr('title', 'Email is not valid');
            valid = false;
        } else {
            $("input[name=email]").parent().css('border', '1px solid #d2d3d4');
            $("input[name=email]").attr('title', '');
        }
    }
    if (valid == true) {
        $('#contactUsForm').submit();
    }
    return valid;
}

function validateEBookForm() {
    var valid = true;
    if (!$("input[name=first_name]").val()) {
        $("input[name=first_name]").parent().css('border', '2px solid red');
        $("input[name=first_name]").attr('title', 'First name is required');
        valid = false;
    } else {
        $("input[name=first_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=first_name]").attr('title', '');
    }
    if (!$("input[name=last_name]").val()) {
        $("input[name=last_name]").parent().css('border', '2px solid red');
        $("input[name=last_name]").attr('title', 'Last name is required');
        valid = false;
    } else {
        $("input[name=last_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=last_name]").attr('title', '');
    }
    if (!$("input[name=email]").val()) {
        $("input[name=email]").parent().css('border', '2px solid red');
        $("input[name=email]").attr('title', 'Email is required');
        valid = false;
    } else {
        email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        if (!email_regex.test($('input[name=email]').val())) {
            $("input[name=email]").parent().css('border', '2px solid red');
            $("input[name=email]").attr('title', 'Email is not valid');
            valid = false;
        } else {
            $("input[name=email]").parent().css('border', '1px solid #d2d3d4');
            $("input[name=email]").attr('title', '');
        }
    }
    if (valid == true) {
        $('#eBookForm').submit();
    }
    return valid;
}

function getMakeList(id) {
    if (id == 'MakerList')
        var year = $('#YearList_input').val();
    if (id == 'MakerList1')
        var year = $('#YearList1_input').val();
    $.get('/api/getMakeList', { year: year }, function(data) {
        if (data.length > 0) {
            var item = '';
            data.forEach(function(res, i) {
                item += '<div class="item">' + res.make_display + '</div>';
            });
            $('#' + id).html(item);
        }
    });
}

function getModelList(id) {
    if (id == 'ModelList') {
        var make = $('#MakerList_input').val();
        var year = $('#YearList_input').val();
    }
    if (id == 'ModelList1') {
        var make = $('#MakerList1_input').val();
        var year = $('#YearList1_input').val();
    }

    $.get('/api/getModelList', { year: year, make: make }, function(data) {
        if (data.length > 0) {
            var item = '';
            data.forEach(function(res, i) {
                item += '<div class="item" data-id="' + res.model_make_id + '">' + res.model_name + '</div>';
            });
            $('#' + id).html(item);
        }
    });
}

function getTrimList(id) {
    if (id == 'TrimList') {
        var make = $('#ModelList_input').data('id');
        var model = $('#ModelList_input').val();
    }
    if (id == 'TrimList1') {
        var make = $('#ModelList1_input').data('id');
        var model = $('#ModelList1_input').val();
    }
    $.get('/api/getTrimList', { model: model, make: make }, function(data) {
        if (data.length > 0) {
            var item = '';
            data.forEach(function(res, i) {
                if (res.model_trim != "")
                    item += '<div class="item">' + res.model_trim + '</div>';
            });
            $('#' + id).html(item);
        }
    });
}

/**** Car Insurance Validation Start ****/
function validatecarInsuranceFormStep1() {
    var valid = true;
    if ($('input#add_another_vehicle').is(':checked')) {
        var year_input = document.getElementsByName('year[]');
        $.each(year_input, function(i, val) {
            if (!$(this).val()) {
                $(this).parent().css('border', '2px solid red');
                $(this).attr('title', 'Vehicle year is required');
                valid = false;
            } else {
                $(this).parent().css('border', '1px solid #d2d3d4');
                $(this).attr('title', '');
            }
        });
        var maker_input = document.getElementsByName('maker[]');
        $.each(maker_input, function(i, val) {
            if (!$(this).val()) {
                $(this).parent().css('border', '2px solid red');
                $(this).attr('title', 'Vehicle maker is required');
                valid = false;
            } else {
                $(this).parent().css('border', '1px solid #d2d3d4');
                $(this).attr('title', '');
            }
        });
        var model_input = document.getElementsByName('model[]');
        $.each(model_input, function(i, val) {
            if (!$(this).val()) {
                $(this).parent().css('border', '2px solid red');
                $(this).attr('title', 'Vehicle model is required');
                valid = false;
            } else {
                $(this).parent().css('border', '1px solid #d2d3d4');
                $(this).attr('title', '');
            }
        });
        /*var trim_input = document.getElementsByName('trim[]');
         $.each(trim_input, function (i, val) {
         if (!$(this).val()) {
         $(this).parent().css('border', '2px solid red');
         $(this).attr('title', 'Vehicle trim is required');
         valid = false;
         } else {
         $(this).parent().css('border', '1px solid #d2d3d4');
         $(this).attr('title', '');
         }
         });*/
    } else {
        if (!$("input[id=YearList_input]").val()) {
            $("input[id=YearList_input]").parent().css('border', '2px solid red');
            $("input[id=YearList_input]").attr('title', 'Vehicle year is required');
            valid = false;
        } else {
            $("input[id=YearList_input]").parent().css('border', '1px solid #d2d3d4');
            $("input[id=YearList_input]").attr('title', '');
        }
        if (!$("input[id=MakerList_input]").val()) {
            $("input[id=MakerList_input]").parent().css('border', '2px solid red');
            $("input[id=MakerList_input]").attr('title', 'Vehicle maker is required');
            valid = false;
        } else {
            $("input[id=MakerList_input]").parent().css('border', '1px solid #d2d3d4');
            $("input[id=MakerList_input]").attr('title', '');
        }
        if (!$("input[id=ModelList_input]").val()) {
            $("input[id=ModelList_input]").parent().css('border', '2px solid red');
            $("input[id=ModelList_input]").attr('title', 'Vehicle model is required');
            valid = false;
        } else {
            $("input[id=ModelList_input]").parent().css('border', '1px solid #d2d3d4');
            $("input[id=ModelList_input]").attr('title', '');
        }
        /*if (!$("input[id=TrimList_input]").val()) {
         $("input[id=TrimList_input]").parent().css('border', '2px solid red');
         $("input[id=TrimList_input]").attr('title', 'Vehicle trim is required');
         valid = false;
         } else {
         $("input[id=TrimList_input]").parent().css('border', '1px solid #d2d3d4');
         $("input[id=TrimList_input]").attr('title', '');
         }*/
    }

    if (valid == false) {
        $('#save_continue1').attr('show-step', '');
    } else {
        $('#save_continue1').attr('show-step', 'step-2');
    }
    return valid;
}

function validatecarInsuranceFormStep2() {
    var valid = true;
    if (!$("input[id=mileage]").val()) {
        $("input[id=mileage]").parent().css('border', '2px solid red');
        $("input[id=mileage]").attr('title', 'Estimated mileage is required');
        valid = false;
    } else {
        $("input[id=mileage]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=mileage]").attr('title', '');
    }
    if (!$("input[id=Perlist_input]").val()) {
        $("input[id=Perlist_input]").parent().css('border', '2px solid red');
        $("input[id=Perlist_input]").attr('title', 'Frequency is required');
        valid = false;
    } else {
        $("input[id=Perlist_input]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=Perlist_input]").attr('title', '');
    }

    if (valid == false) {
        $('#save_continue2').attr('show-step', '');
    } else {
        $('#save_continue2').attr('show-step', 'step-3');
    }
    return valid;
}

function validatecarInsuranceFormStep3() {
    var valid = true;
    if (!$("input[id=first_name]").val()) {
        $("input[id=first_name]").parent().css('border', '2px solid red');
        $("input[id=first_name]").attr('title', 'First name is required');
        valid = false;
    } else {
        $("input[id=first_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=first_name]").attr('title', '');
    }
    if (!$("input[id=last_name]").val()) {
        $("input[id=last_name]").parent().css('border', '2px solid red');
        $("input[id=last_name]").attr('title', 'Last name is required');
        valid = false;
    } else {
        $("input[id=last_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=last_name]").attr('title', '');
    }
    if (!$("input[id=dob]").val()) {
        $("input[id=dob]").parent().css('border', '2px solid red');
        $("input[id=dob]").attr('title', 'DOB is required');
        valid = false;
    } else {
        $("input[id=dob]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=dob]").attr('title', '');
    }
    if (!$("input[id=phone_number]").val()) {
        $("input[id=phone_number]").parent().css('border', '2px solid red');
        $("input[id=phone_number]").attr('title', 'Phone number is required');
        valid = false;
    } else {
        $("input[id=phone_number]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=phone_number]").attr('title', '');
    }
    if (!$("input[id=unit]").val()) {
        $("input[id=unit]").parent().css('border', '2px solid red');
        $("input[id=unit]").attr('title', 'Unit# is required');
        valid = false;
    } else {
        $("input[id=unit]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=unit]").attr('title', '');
    }
    if (!$("input[id=zipcode]").val()) {
        $("input[id=zipcode]").parent().css('border', '2px solid red');
        $("input[id=zipcode]").attr('title', 'Zipcode is required');
        valid = false;
    } else {
        $("input[id=zipcode]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=zipcode]").attr('title', '');
    }

    if (valid == false) {
        $('#save_continue3').attr('show-step', '');
    } else {
        $('#save_continue3').attr('show-step', 'step-4');
    }
    return valid;
}

function validatecarInsuranceFormStep4() {
    var valid = true;
    if (!$('input[name=gender]').is(':checked')) {
        $("input[name=gender]").parent().css('border', '2px solid red');
        $("input[name=gender]").attr('title', 'Gender is required');
        valid = false;
    } else {
        $("input[name=gender]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=gender]").attr('title', '');
    }
    if (!$('input[name=marital_status]').is(':checked')) {
        $("input[name=marital_status]").parent().css('border', '2px solid red');
        $("input[name=marital_status]").attr('title', 'Marital status is required');
        valid = false;
    } else {
        $("input[name=marital_status]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=marital_status]").attr('title', '');
    }
    if (!$('input[name=residence_ownership]').is(':checked')) {
        $("input[name=residence_ownership]").parent().css('border', '2px solid red');
        $("input[name=residence_ownership]").attr('title', 'Residence ownership is required');
        valid = false;
    } else {
        $("input[name=residence_ownership]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=residence_ownership]").attr('title', '');
    }
    if (!$('input[name=credit_score]').is(':checked')) {
        $("input[name=credit_score]").parent().css('border', '2px solid red');
        $("input[name=credit_score]").attr('title', 'Credit score is required');
        valid = false;
    } else {
        $("input[name=credit_score]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=credit_score]").attr('title', '');
    }
    if (!$('input[name=education]').is(':checked')) {
        $("input[name=education]").parent().css('border', '2px solid red');
        $("input[name=education]").attr('title', 'Education is required');
        valid = false;
    } else {
        $("input[name=education]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=education]").attr('title', '');
    }
    if (!$('input[name=currently_insured]').is(':checked')) {
        $("input[name=currently_insured]").parent().css('border', '2px solid red');
        $("input[name=currently_insured]").attr('title', 'Currently insured is required');
        valid = false;
    } else {
        $("input[name=currently_insured]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=currently_insured]").attr('title', '');
    }
    if (!$("input[id=CarrierList_input]").val()) {
        $("input[id=CarrierList_input]").parent().css('border', '2px solid red');
        $("input[id=CarrierList_input]").attr('title', 'Carrier is required');
        valid = false;
    } else {
        $("input[id=CarrierList_input]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=CarrierList_input]").attr('title', '');
    }
    if (!$('input[name=accident]').is(':checked')) {
        $("input[name=accident]").parent().css('border', '2px solid red');
        $("input[name=accident]").attr('title', 'This field is required');
        valid = false;
    } else {
        $("input[name=accident]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=accident]").attr('title', '');
    }
    if (!$("input[id=quote_receive_email]").val()) {
        $("input[id=quote_receive_email]").parent().css('border', '2px solid red');
        $("input[id=quote_receive_email]").attr('title', 'Quote receive email is required');
        valid = false;
    } else {
        email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        if (!email_regex.test($('input[name=quote_receive_email]').val())) {
            $("input[name=quote_receive_email]").parent().css('border', '2px solid red');
            $("input[name=quote_receive_email]").attr('title', 'Email is not valid');
            valid = false;
        } else {
            $("input[name=quote_receive_email]").parent().css('border', '1px solid #d2d3d4');
            $("input[name=quote_receive_email]").attr('title', '');
        }
    }

    if (valid == true) {
        $('#snDriversBtn').addClass('active');
        $('#carInsuranceForm').submit();
    }
    return valid;
}
/**** Car Insurance Validation End ****/

/**** Home Insurance Validation Start ****/
function validateHomeInsuranceFormStep1() {
    var valid = true;
    if (!$('input[name=residence_type]').is(':checked')) {
        $("input[name=residence_type]").parent().css('border', '2px solid red');
        $("input[name=residence_type]").attr('title', 'Residence Type is required');
        valid = false;
    } else {
        $("input[name=residence_type]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=residence_type]").attr('title', '');
    }
    if (!$('input[name=address]').val()) {
        $("input[name=address]").parent().css('border', '2px solid red');
        $("input[name=address]").attr('title', 'Address is required');
        valid = false;
    } else {
        $("input[name=address]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=address]").attr('title', '');
    }
    if (!$('input[name=unit]').val()) {
        $("input[name=unit]").parent().css('border', '2px solid red');
        $("input[name=unit]").attr('title', 'Address unit is required');
        valid = false;
    } else {
        $("input[name=unit]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=unit]").attr('title', '');
    }
    if (!$('input[name=ins_zipcode]').val()) {
        $("input[name=ins_zipcode]").parent().css('border', '2px solid red');
        $("input[name=ins_zipcode]").attr('title', 'Zipcode is required');
        valid = false;
    } else {
        $("input[name=ins_zipcode]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=ins_zipcode]").attr('title', '');
    }
    if (!$('input[name=built_year]').val()) {
        $("input[name=built_year]").parent().css('border', '2px solid red');
        $("input[name=built_year]").attr('title', 'Year is required');
        valid = false;
    } else {
        $("input[name=built_year]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=built_year]").attr('title', '');
    }

    if (valid == false) {
        $('#save_continue1').attr('show-step', '');
    } else {
        $('#save_continue1').attr('show-step', 'step-2');
    }
    return valid;
}

function validateHomeInsuranceFormStep2() {
    var valid = true;
    if (!$('input[name=foundation_type]').val()) {
        $("input[name=foundation_type]").parent().css('border', '2px solid red');
        $("input[name=foundation_type]").attr('title', 'Foundation type is required');
        valid = false;
    } else {
        $("input[name=foundation_type]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=foundation_type]").attr('title', '');
    }
    if (!$('input[name=construction_type]').val()) {
        $("input[name=construction_type]").parent().css('border', '2px solid red');
        $("input[name=construction_type]").attr('title', 'Construction type is required');
        valid = false;
    } else {
        $("input[name=construction_type]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=construction_type]").attr('title', '');
    }
    if (!$('input[name=square_footage]').val()) {
        $("input[name=square_footage]").parent().css('border', '2px solid red');
        $("input[name=square_footage]").attr('title', 'Square footage is required');
        valid = false;
    } else {
        $("input[name=square_footage]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=square_footage]").attr('title', '');
    }
    if (!$('input[name=no_of_stories]').val()) {
        $("input[name=no_of_stories]").parent().css('border', '2px solid red');
        $("input[name=no_of_stories]").attr('title', 'Number of stories is required');
        valid = false;
    } else {
        $("input[name=no_of_stories]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=no_of_stories]").attr('title', '');
    }
    if (!$('input[name=heating_system]').val()) {
        $("input[name=heating_system]").parent().css('border', '2px solid red');
        $("input[name=heating_system]").attr('title', 'Heating system is required');
        valid = false;
    } else {
        $("input[name=heating_system]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=heating_system]").attr('title', '');
    }
    if (!$('input[name=roof_material]').val()) {
        $("input[name=roof_material]").parent().css('border', '2px solid red');
        $("input[name=roof_material]").attr('title', 'Roof material is required');
        valid = false;
    } else {
        $("input[name=roof_material]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=roof_material]").attr('title', '');
    }
    if (!$('input[name=installed_replaced_year]').val()) {
        $("input[name=installed_replaced_year]").parent().css('border', '2px solid red');
        $("input[name=installed_replaced_year]").attr('title', 'Year is required');
        valid = false;
    } else {
        $("input[name=installed_replaced_year]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=installed_replaced_year]").attr('title', '');
    }
    if (!$('input[name=replacement_cost]').val()) {
        $("input[name=replacement_cost]").parent().css('border', '2px solid red');
        $("input[name=replacement_cost]").attr('title', 'Replacement cost is required');
        valid = false;
    } else {
        $("input[name=replacement_cost]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=replacement_cost]").attr('title', '');
    }
    if (!$('input[name=is_in_flood_zone]').is(':checked')) {
        $("input[name=is_in_flood_zone]").parent().css('border', '2px solid red');
        $("input[name=is_in_flood_zone]").attr('title', 'Flood zone is required');
        valid = false;
    } else {
        $("input[name=is_in_flood_zone]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=is_in_flood_zone]").attr('title', '');
    }
    if (!$('input[name=is_fire_hydrant_available]').is(':checked')) {
        $("input[name=is_fire_hydrant_available]").parent().css('border', '2px solid red');
        $("input[name=is_fire_hydrant_available]").attr('title', 'Fire hydrant available is required');
        valid = false;
    } else {
        $("input[name=is_fire_hydrant_available]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=is_fire_hydrant_available]").attr('title', '');
    }
    if (!$('input[name=fire_station_proximity]').is(':checked')) {
        $("input[name=fire_station_proximity]").parent().css('border', '2px solid red');
        $("input[name=fire_station_proximity]").attr('title', 'Near fire station is required');
        valid = false;
    } else {
        $("input[name=fire_station_proximity]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=fire_station_proximity]").attr('title', '');
    }

    if (valid == false) {
        $('#save_continue2').attr('show-step', '');
    } else {
        $('#snHomeBtn').addClass('active');
        $('#save_continue2').attr('show-step', 'step-3');
    }
    return valid;
}

function validateHomeInsuranceFormStep3() {
    var valid = true;
    if (!$('input[name=first_name]').val()) {
        $("input[name=first_name]").parent().css('border', '2px solid red');
        $("input[name=first_name]").attr('title', 'First name is required');
        valid = false;
    } else {
        $("input[name=first_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=first_name]").attr('title', '');
    }
    if (!$('input[name=last_name]').val()) {
        $("input[name=last_name]").parent().css('border', '2px solid red');
        $("input[name=last_name]").attr('title', 'Last name is required');
        valid = false;
    } else {
        $("input[name=last_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=last_name]").attr('title', '');
    }
    if (!$('input[name=dob]').val()) {
        $("input[name=dob]").parent().css('border', '2px solid red');
        $("input[name=dob]").attr('title', 'DOB is required');
        valid = false;
    } else {
        $("input[name=dob]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=dob]").attr('title', '');
    }
    if (!$('input[name=email]').val()) {
        $("input[name=email]").parent().css('border', '2px solid red');
        $("input[name=email]").attr('title', 'Email is required');
        valid = false;
    } else {
        email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        if (!email_regex.test($('input[name=email]').val())) {
            $("input[name=email]").parent().css('border', '2px solid red');
            $("input[name=email]").attr('title', 'Email is not valid');
            valid = false;
        } else {
            $("input[name=email]").parent().css('border', '1px solid #d2d3d4');
            $("input[name=email]").attr('title', '');
        }
    }
    if (!$('input[name=home_purchase_status]').is(':checked')) {
        $("input[name=home_purchase_status]").parent().css('border', '2px solid red');
        $("input[name=home_purchase_status]").attr('title', 'Home purchase status is required');
        valid = false;
    } else {
        $("input[name=home_purchase_status]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=home_purchase_status]").attr('title', '');
    }

    if (valid == true) {
        $('#snOwnerBtn').addClass('active');
        $('#homeInsuranceForm').submit();
    }
    return valid;
}
/**** Home Insurance Validation End ****/

/**** Business Insurance Validation Start ****/
function validateBusinessInsuranceFormStep1() {
    var valid = true;
    if (!$('input[name=business_type]').val()) {
        $("input[name=business_type]").parent().css('border', '2px solid red');
        $("input[name=business_type]").attr('title', 'Business type is required');
        valid = false;
    } else {
        $("input[name=business_type]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=business_type]").attr('title', '');
    }

    if (valid == false) {
        $('#save_continue1').attr('show-step', '');
    } else {
        $('#save_continue1').attr('show-step', 'step-2');
    }
    return valid;
}

function validateBusinessInsuranceFormStep2() {
    var valid = true;
    $('#industry_val').html('');
    if (!$('input[name=business_classification]').is(':checked')) {
        $("input[name=business_classification]").parent().css('border', '2px solid red');
        $("input[name=business_classification]").attr('title', 'Business classification is required');
        valid = false;
    } else {
        $("input[name=business_classification]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=business_classification]").attr('title', '');
    }

    if (valid == false) {
        $('#save_continue2').attr('show-step', '');
    } else {
        var checkedVal = '';
        $("input[name='business_classification']:checked").each(function() {
            checkedVal = $(this).val();
        });
        var type = getIndustryType(checkedVal);
        $('#industry_val').html(type);
        $('#snRecommandationBtn').addClass('active');
        $('#save_continue2').attr('show-step', 'step-3');
    }
    return valid;
}

function getIndustryType(type) {
    type = parseInt(type);
    var typeVal = '';
    switch (type) {
        case 1:
            typeVal = 'Retail Bakeries';
            break;
        case 2:
            typeVal = 'Other Building Material Dealers';
            break;
        case 3:
            typeVal = 'Art Dealers';
            break;
        case 4:
            typeVal = 'Other Direct Selling Establishments';
            break;
        case 5:
            typeVal = 'Communication Equipment Repair and Maintenance';
            break;
        case 6:
            typeVal = 'Candy shop';
            break;
        case 7:
            typeVal = 'Art Gallery';
            break;
        case 8:
            typeVal = 'Mailing Or Addressing Company';
            break;
        case 9:
            typeVal = 'Popcorn Shop';
            break;
        case 10:
            typeVal = 'Pretzel Shop';
            break;
    }
    return typeVal;
}

function validateBusinessInsuranceFormStep3() {
    var valid = true;
    if (!$('input[name=business_name]').val()) {
        $("input[name=business_name]").parent().css('border', '2px solid red');
        $("input[name=business_name]").attr('title', 'Business name is required');
        valid = false;
    } else {
        $("input[name=business_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=business_name]").attr('title', '');
    }
    if (!$('input[id=StateList_input]').val()) {
        $("input[id=StateList_input]").parent().css('border', '2px solid red');
        $("input[id=StateList_input]").attr('title', 'State is required');
        valid = false;
    } else {
        $('#state_id').val($('input[id=StateList_input]').attr("data-id"));
        $("input[id=StateList_input]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=StateList_input]").attr('title', '');
    }
    if (!$('input[id=no_of_employee]').val()) {
        $("input[id=no_of_employee]").parent().css('border', '2px solid red');
        $("input[id=no_of_employee]").attr('title', 'Number of employee is required');
        valid = false;
    } else {
        $("input[id=no_of_employee]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=no_of_employee]").attr('title', '');
    }
    if (!$('input[name=work_from]').is(':checked')) {
        $("input[name=work_from]").parent().css('border', '2px solid red');
        $("input[name=work_from]").attr('title', 'Work from is required');
        valid = false;
    } else {
        $("input[name=work_from]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=work_from]").attr('title', '');
    }
    if (!$('input[name=provide_facility]').is(':checked')) {
        $("input[name=provide_facility]").parent().css('border', '2px solid red');
        $("input[name=provide_facility]").attr('title', 'This field is required');
        valid = false;
    } else {
        $("input[name=provide_facility]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=provide_facility]").attr('title', '');
    }
    if (!$('input[name=vehicle_type]').is(':checked')) {
        $("input[name=vehicle_type]").parent().css('border', '2px solid red');
        $("input[name=vehicle_type]").attr('title', 'Vehicle type is required');
        valid = false;
    } else {
        $("input[name=vehicle_type]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=vehicle_type]").attr('title', '');
    }

    if (valid == false) {
        $('#save_continue3').attr('show-step', '');
    } else {
        $('#snBusinessBtn').addClass('active');
        $('#save_continue3').attr('show-step', 'step-4');
    }
    return valid;
}

function validateBusinessInsuranceFormStep5() {
    var valid = true;
    if (!$('input[name=first_name]').val()) {
        $("input[name=first_name]").parent().css('border', '2px solid red');
        $("input[name=first_name]").attr('title', 'First name is required');
        valid = false;
    } else {
        $("input[name=first_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=first_name]").attr('title', '');
    }
    if (!$('input[name=last_name]').val()) {
        $("input[name=last_name]").parent().css('border', '2px solid red');
        $("input[name=last_name]").attr('title', 'Last name is required');
        valid = false;
    } else {
        $("input[name=last_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=last_name]").attr('title', '');
    }
    if (!$('input[name=phone_number]').val()) {
        $("input[name=phone_number]").parent().css('border', '2px solid red');
        $("input[name=phone_number]").attr('title', 'Phone number is required');
        valid = false;
    } else {
        $("input[name=phone_number]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=phone_number]").attr('title', '');
    }
    if (!$('input[name=email]').val()) {
        $("input[name=email]").parent().css('border', '2px solid red');
        $("input[name=email]").attr('title', 'Email is required');
        valid = false;
    } else {
        email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        if (!email_regex.test($('input[name=email]').val())) {
            $("input[name=email]").parent().css('border', '2px solid red');
            $("input[name=email]").attr('title', 'Email is not valid');
            valid = false;
        } else {
            $("input[name=email]").parent().css('border', '1px solid #d2d3d4');
            $("input[name=email]").attr('title', '');
        }
    }

    if (valid == false) {
        $('#save_continue5').attr('show-step', '');
    } else {
        $('#save_continue5').attr('show-step', 'step-6');
    }
    return valid;
}

function validateBusinessInsuranceFormStep6() {
    var valid = true;
    if (!$('input[name=address_line1]').val() && !$('input[name=address_line2]').val()) {
        $("input[name=address_line1]").parent().css('border', '2px solid red');
        $("input[name=address_line1]").attr('title', 'Address line1 is required');
        $("input[name=address_line2]").parent().css('border', '2px solid red');
        $("input[name=address_line2]").attr('title', 'Address line2 is required');
        valid = false;
    } else {
        $("input[name=address_line1]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=address_line1]").attr('title', '');
        $("input[name=address_line2]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=address_line2]").attr('title', '');
    }
    if (!$('input[id=AddressStateList_input]').val()) {
        $("input[id=AddressStateList_input]").parent().css('border', '2px solid red');
        $("input[id=AddressStateList_input]").attr('title', 'Address state is required');
        valid = false;
    } else {
        $('#address_state_id').val($('input[id=AddressStateList_input]').attr("data-id"));
        $("input[id=AddressStateList_input]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=AddressStateList_input]").attr('title', '');
    }
    if (!$('input[name=city]').val()) {
        $("input[name=city]").parent().css('border', '2px solid red');
        $("input[name=city]").attr('title', 'City is required');
        valid = false;
    } else {
        $("input[name=city]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=city]").attr('title', '');
    }
    if (!$('input[name=zipcode]').val()) {
        $("input[name=zipcode]").parent().css('border', '2px solid red');
        $("input[name=zipcode]").attr('title', 'Zipcode is required');
        valid = false;
    } else {
        $("input[name=zipcode]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=zipcode]").attr('title', '');
    }
    if (!$('input[name=mailing_address_same]').is(':checked')) {
        $("input[name=mailing_address_same]").parent().css('border', '2px solid red');
        $("input[name=mailing_address_same]").attr('title', 'This field is required');
        valid = false;
    } else {
        $("input[name=mailing_address_same]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=mailing_address_same]").attr('title', '');
    }
    if (!$('input[name=business_other_location]').is(':checked')) {
        $("input[name=business_other_location]").parent().css('border', '2px solid red');
        $("input[name=business_other_location]").attr('title', 'This field is required');
        valid = false;
    } else {
        $("input[name=business_other_location]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=business_other_location]").attr('title', '');
    }
    if (!$('input[name=square_footage]').val()) {
        $("input[name=square_footage]").parent().css('border', '2px solid red');
        $("input[name=square_footage]").attr('title', 'Square footage is required');
        valid = false;
    } else {
        $("input[name=square_footage]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=square_footage]").attr('title', '');
    }

    if (valid == false) {
        $('#save_continue6').attr('show-step', '');
    } else {
        var checkedVal = '';
        $("input[name='mailing_address_same']:checked").each(function() {
            checkedVal = $(this).val();
        });
        if (checkedVal == "no") {
            $('#save_continue6').attr('show-step', 'step-mailing-address');
        } else {
            $('#save_continue6').attr('show-step', 'step-7');
        }
    }
    return valid;
}

function validateBusinessInsuranceFormForMailingAddress() {
    var valid = true;
    $('#mailing_add_div').css('display', 'block');
    if (!$('input[name=mailing_address_line1]').val() && !$('input[name=mailing_address_line2]').val()) {
        $("input[name=mailing_address_line1]").parent().css('border', '2px solid red');
        $("input[name=mailing_address_line1]").attr('title', 'Address line1 is required');
        $("input[name=mailing_address_line2]").parent().css('border', '2px solid red');
        $("input[name=mailing_address_line2]").attr('title', 'Address line2 is required');
        valid = false;
    } else {
        $("input[name=mailing_address_line1]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=mailing_address_line1]").attr('title', '');
        $("input[name=mailing_address_line2]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=mailing_address_line2]").attr('title', '');
    }
    if (!$('input[id=MailingAddressStateList_input]').val()) {
        $("input[id=MailingAddressStateList_input]").parent().css('border', '2px solid red');
        $("input[id=MailingAddressStateList_input]").attr('title', 'Address state is required');
        valid = false;
    } else {
        $('#mailing_address_state_id').val($('input[id=MailingAddressStateList_input]').attr("data-id"));
        $("input[id=MailingAddressStateList_input]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=MailingAddressStateList_input]").attr('title', '');
    }
    if (!$('input[name=mailing_city]').val()) {
        $("input[name=mailing_city]").parent().css('border', '2px solid red');
        $("input[name=mailing_city]").attr('title', 'City is required');
        valid = false;
    } else {
        $("input[name=mailing_city]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=mailing_city]").attr('title', '');
    }
    if (!$('input[name=mailing_zipcode]').val()) {
        $("input[name=mailing_zipcode]").parent().css('border', '2px solid red');
        $("input[name=mailing_zipcode]").attr('title', 'Zipcode is required');
        valid = false;
    } else {
        $("input[name=mailing_zipcode]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=mailing_zipcode]").attr('title', '');
    }

    if (valid == false) {
        $('#mailing_save_continue').attr('show-step', '');
    } else {
        $('#mailing_save_continue').attr('show-step', 'step-7');
    }
    return valid;
}

function validateBusinessInsuranceFormStep7() {
    var valid = true;
    if (!$('input[id=BusinessStructureList_input]').val()) {
        $("input[id=BusinessStructureList_input]").parent().css('border', '2px solid red');
        $("input[id=BusinessStructureList_input]").attr('title', 'Address state is required');
        valid = false;
    } else {
        $('#business_structure').val($('input[id=BusinessStructureList_input]').attr("data-id"));
        $("input[id=BusinessStructureList_input]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=BusinessStructureList_input]").attr('title', '');
    }
    if (!$('input[name=establish_date]').val()) {
        $("input[name=establish_date]").parent().css('border', '2px solid red');
        $("input[name=establish_date]").attr('title', 'Date established is required');
        valid = false;
    } else {
        $("input[name=establish_date]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=establish_date]").attr('title', '');
    }
    if (!$('input[name=business_owned_vehicle]').val()) {
        $("input[name=business_owned_vehicle]").parent().css('border', '2px solid red');
        $("input[name=business_owned_vehicle]").attr('title', 'Number of business owned vehicle is required');
        valid = false;
    } else {
        $("input[name=business_owned_vehicle]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=business_owned_vehicle]").attr('title', '');
    }
    if (!$('input[name=annual_revenue]').val()) {
        $("input[name=annual_revenue]").parent().css('border', '2px solid red');
        $("input[name=annual_revenue]").attr('title', 'Project annual revenue is required');
        valid = false;
    } else {
        $("input[name=annual_revenue]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=annual_revenue]").attr('title', '');
    }
    if (!$('input[name=annual_payroll]').val()) {
        $("input[name=annual_payroll]").parent().css('border', '2px solid red');
        $("input[name=annual_payroll]").attr('title', 'Annual payroll is required');
        valid = false;
    } else {
        $("input[name=annual_payroll]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=annual_payroll]").attr('title', '');
    }
    if (!$('input[name=personal_property_value]').val()) {
        $("input[name=personal_property_value]").parent().css('border', '2px solid red');
        $("input[name=personal_property_value]").attr('title', 'Value of business personal property is required');
        valid = false;
    } else {
        $("input[name=personal_property_value]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=personal_property_value]").attr('title', '');
    }
    if (!$('input[name=website]').val()) {
        $("input[name=website]").parent().css('border', '2px solid red');
        $("input[name=website]").attr('title', 'Website is required');
        valid = false;
    } else {
        $("input[name=website]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=website]").attr('title', '');
    }

    if (valid == true) {
        $('#businessInsuranceForm').submit();
    }
    return valid;
}
/**** Business Insurance Validation End ****/

/**** Work Insurance Validation Start ****/
function validateWorkInsuranceFormStep1() {
    var valid = true;
    if (!$('input[name=business_name]').val()) {
        $("input[name=business_name]").parent().css('border', '2px solid red');
        $("input[name=business_name]").attr('title', 'Business name is required');
        valid = false;
    } else {
        $("input[name=business_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=business_name]").attr('title', '');
    }

    if (valid == false) {
        $('#save_continue1').attr('show-step', '');
    } else {
        $('#save_continue1').attr('show-step', 'step-2');
    }
    return valid;
}

function validateWorkInsuranceFormStep2() {
    var valid = true;
    if (!$("input[name=first_name]").val()) {
        $("input[name=first_name]").parent().css('border', '2px solid red');
        $("input[name=first_name]").attr('title', 'First name is required');
        valid = false;
    } else {
        $("input[name=first_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=first_name]").attr('title', '');
    }
    if (!$("input[name=last_name]").val()) {
        $("input[name=last_name]").parent().css('border', '2px solid red');
        $("input[name=last_name]").attr('title', 'Last name is required');
        valid = false;
    } else {
        $("input[name=last_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=last_name]").attr('title', '');
    }
    if (!$("input[name=phone_number]").val()) {
        $("input[name=phone_number]").parent().css('border', '2px solid red');
        $("input[name=phone_number]").attr('title', 'Phone number is required');
        valid = false;
    } else {
        $("input[name=phone_number]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=phone_number]").attr('title', '');
    }
    if (!$("input[name=email]").val()) {
        $("input[name=email]").parent().css('border', '2px solid red');
        $("input[name=email]").attr('title', 'Email is required');
        valid = false;
    } else {
        email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        if (!email_regex.test($('input[name=email]').val())) {
            $("input[name=email]").parent().css('border', '2px solid red');
            $("input[name=email]").attr('title', 'Email is not valid');
            valid = false;
        } else {
            $("input[name=email]").parent().css('border', '1px solid #d2d3d4');
            $("input[name=email]").attr('title', '');
        }
    }

    if (valid == false) {
        $('#save_continue2').attr('show-step', '');
    } else {
        $('#save_continue2').attr('show-step', 'step-3');
    }
    return valid;
}

function validateWorkInsuranceFormStep3() {
    var valid = true;
    if (!$('input[name=business_establish_year]').val()) {
        $("input[name=business_establish_year]").parent().css('border', '2px solid red');
        $("input[name=business_establish_year]").attr('title', 'Year is required');
        valid = false;
    } else {
        $("input[name=business_establish_year]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=business_establish_year]").attr('title', '');
    }

    if (valid == false) {
        $('#save_continue3').attr('show-step', '');
    } else {
        $('#save_continue3').attr('show-step', 'step-4');
    }
    return valid;
}

function validateWorkInsuranceFormStep4() {
    var valid = true;
    var error = 1;
    var business_legal_structure = document.getElementsByName('business_legal_structure[]');
    $.each(business_legal_structure, function(i, val) {
        if (!$(this).is(':checked')) {
            $(this).parent().css('border', '2px solid red');
            $(this).attr('title', 'Business legal structure is required');
        } else {
            $(this).parent().css('border', '1px solid #d2d3d4');
            $(this).attr('title', '');
            error = 0;
        }
    });

    valid = (error == 1) ? false : true;
    if (valid == false) {
        $('#save_continue4').attr('show-step', '');
    } else {
        $('#save_continue4').attr('show-step', 'step-5');
    }
    return valid;
}

function validateWorkInsuranceFormStep7() {
    var valid = true;
    if (!$('input[name=type_of_work]').val()) {
        $("input[name=type_of_work]").parent().css('border', '2px solid red');
        $("input[name=type_of_work]").attr('title', 'Type of work is required');
        valid = false;
    } else {
        $("input[name=type_of_work]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=type_of_work]").attr('title', '');
    }

    if (valid == false) {
        $('#save_continue7').attr('show-step', '');
    } else {
        $('#save_continue7').attr('show-step', 'step-8');
    }
    return valid;
}

function validateWorkInsuranceFormStep8() {
    var valid = true;
    if (!$('input[name=worker_comp_ins]').is(':checked')) {
        $("input[name=worker_comp_ins]").parent().css('border', '2px solid red');
        $("input[name=worker_comp_ins]").attr('title', 'This field is required');
        valid = false;
    } else {
        $("input[name=worker_comp_ins]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=worker_comp_ins]").attr('title', '');
    }

    if (valid == false) {
        $('#save_continue8').attr('show-step', '');
    } else {
        $('#save_continue8').attr('show-step', 'step-9');
    }
    return valid;
}

function validateWorkInsuranceFormStep9() {
    var valid = true;
    if (!$('input[name=worker_comp_ins_year]').is(':checked')) {
        $("input[name=worker_comp_ins_year]").parent().css('border', '2px solid red');
        $("input[name=worker_comp_ins_year]").attr('title', 'This field is required');
        valid = false;
    } else {
        $("input[name=worker_comp_ins_year]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=worker_comp_ins_year]").attr('title', '');
    }

    if (valid == false) {
        $('#save_continue9').attr('show-step', '');
    } else {
        $('#save_continue9').attr('show-step', 'step-10');
    }
    return valid;
}
/**** Work Insurance Validation End ****/

/**** Referal Page Validation Start ****/
function validateReferalForm() {
    var valid = true;
    if (!$('input[name=sender_first_name]').val()) {
        $("input[name=sender_first_name]").parent().css('border', '2px solid red');
        $("input[name=sender_first_name]").attr('title', 'First name is required');
        valid = false;
    } else {
        $("input[name=sender_first_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=sender_first_name]").attr('title', '');
    }

    if (!$('input[name=sender_last_name]').val()) {
        $("input[name=sender_last_name]").parent().css('border', '2px solid red');
        $("input[name=sender_last_name]").attr('title', 'Last name is required');
        valid = false;
    } else {
        $("input[name=sender_last_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=sender_last_name]").attr('title', '');
    }

    if (!$('input[name=sender_email]').val()) {
        $("input[name=sender_email]").parent().css('border', '2px solid red');
        $("input[name=sender_email]").attr('title', 'Email is required');
        valid = false;
    } else {
        email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        if (!email_regex.test($('input[name=sender_email]').val())) {
            $("input[name=sender_email]").parent().css('border', '2px solid red');
            $("input[name=sender_email]").attr('title', 'Email is not valid');
            valid = false;
        } else {
            $("input[name=sender_email]").parent().css('border', '1px solid #d2d3d4');
            $("input[name=sender_email]").attr('title', '');
        }
    }

    if (!$('input[name=sender_phone_no]').val()) {
        $("input[name=sender_phone_no]").parent().css('border', '2px solid red');
        $("input[name=sender_phone_no]").attr('title', 'Phone number is required');
        valid = false;
    } else {
        $("input[name=sender_phone_no]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=sender_phone_no]").attr('title', '');
    }

    var referal_first_name = document.getElementsByName('referal_first_name[]');
    var referal_last_name = document.getElementsByName('referal_last_name[]');
    var referal_email = document.getElementsByName('referal_email[]');
    var referal_phone_no = document.getElementsByName('referal_phone_no[]');
    $.each(referal_first_name, function(i, val) {
        if (!$(this).val()) {
            $(this).parent().css('border', '2px solid red');
            $(this).attr('title', 'First name is required');
            valid = false;
        } else {
            $(this).parent().css('border', '1px solid #d2d3d4');
            $(this).attr('title', '');
        }
    });
    $.each(referal_last_name, function(i, val) {
        if (!$(this).val()) {
            $(this).parent().css('border', '2px solid red');
            $(this).attr('title', 'Last name is required');
            valid = false;
        } else {
            $(this).parent().css('border', '1px solid #d2d3d4');
            $(this).attr('title', '');
        }
    });
    $.each(referal_email, function(i, val) {
        if (!$(this).val()) {
            $(this).parent().css('border', '2px solid red');
            $(this).attr('title', 'Email is required');
            valid = false;
        } else {
            $(this).parent().css('border', '1px solid #d2d3d4');
            $(this).attr('title', '');
        }
    });
    $.each(referal_phone_no, function(i, val) {
        if (!$(this).val()) {
            $(this).parent().css('border', '2px solid red');
            $(this).attr('title', 'Phone number is required');
            valid = false;
        } else {
            $(this).parent().css('border', '1px solid #d2d3d4');
            $(this).attr('title', '');
        }
    });


    if (valid == true) {
        $('#referalForm').submit();
    }
    return valid;
}
/**** Referal Page Validation End ****/

/**** Renter Validation Start ****/
function validateRenterInsuranceForm() {
    var valid = true;
    if (!$('input[name=first_name]').val()) {
        $("input[name=first_name]").parent().css('border', '2px solid red');
        $("input[name=first_name]").attr('title', 'First name is required');
        valid = false;
    } else {
        $("input[name=first_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=first_name]").attr('title', '');
    }

    if (!$('input[name=last_name]').val()) {
        $("input[name=last_name]").parent().css('border', '2px solid red');
        $("input[name=last_name]").attr('title', 'Last name is required');
        valid = false;
    } else {
        $("input[name=last_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=last_name]").attr('title', '');
    }

    if (!$('input[name=email]').val()) {
        $("input[name=email]").parent().css('border', '2px solid red');
        $("input[name=email]").attr('title', 'Email is required');
        valid = false;
    } else {
        email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        if (!email_regex.test($('input[name=email]').val())) {
            $("input[name=email]").parent().css('border', '2px solid red');
            $("input[name=email]").attr('title', 'Email is not valid');
            valid = false;
        } else {
            $("input[name=email]").parent().css('border', '1px solid #d2d3d4');
            $("input[name=email]").attr('title', '');
        }
    }

    if (!$('input[name=phone_number]').val()) {
        $("input[name=phone_number]").parent().css('border', '2px solid red');
        $("input[name=phone_number]").attr('title', 'Phone number is required');
        valid = false;
    } else {
        $("input[name=phone_number]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=phone_number]").attr('title', '');
    }

    if (!$('input[name=address_line1]').val()) {
        $("input[name=address_line1]").parent().css('border', '2px solid red');
        $("input[name=address_line1]").attr('title', 'Address is required');
        valid = false;
    } else {
        $("input[name=address_line1]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=address_line1]").attr('title', '');
    }

    if (!$('input[id=StateList_input]').val()) {
        $("input[id=StateList_input]").parent().css('border', '2px solid red');
        $("input[id=StateList_input]").attr('title', 'State is required');
        valid = false;
    } else {
        $('#state_id').val($('input[id=StateList_input]').attr("data-id"));
        console.log($('input[id=StateList_input]').attr("data-id"));
        $("input[id=StateList_input]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=StateList_input]").attr('title', '');
    }

    if (!$('input[name=city]').val()) {
        $("input[name=city]").parent().css('border', '2px solid red');
        $("input[name=city]").attr('title', 'City is required');
        valid = false;
    } else {
        $("input[name=city]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=city]").attr('title', '');
    }

    if (!$('input[name=zipcode]').val()) {
        $("input[name=zipcode]").parent().css('border', '2px solid red');
        $("input[name=zipcode]").attr('title', 'Zipcode is required');
        valid = false;
    } else {
        $("input[name=zipcode]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=zipcode]").attr('title', '');
    }

    if (!$('input[name=personal_property_amount]').val()) {
        $("input[name=personal_property_amount]").parent().css('border', '2px solid red');
        $("input[name=personal_property_amount]").attr('title', 'Personal property amount is required');
        valid = false;
    } else {
        $("input[name=personal_property_amount]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=personal_property_amount]").attr('title', '');
    }

    if (valid == true) {
        $('#renterInsuranceForm').submit();
    }
    return valid;
}
/**** Renter Page Validation End ****/

/**** Home Insurance Floater Validation Start ****/
function validateHomeInsuranceFloaterForm() {
    var valid = true;
    if (!$('input[name=first_name]').val()) {
        $("input[name=first_name]").parent().css('border', '2px solid red');
        $("input[name=first_name]").attr('title', 'First name is required');
        valid = false;
    } else {
        $("input[name=first_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=first_name]").attr('title', '');
    }

    if (!$('input[name=last_name]').val()) {
        $("input[name=last_name]").parent().css('border', '2px solid red');
        $("input[name=last_name]").attr('title', 'Last name is required');
        valid = false;
    } else {
        $("input[name=last_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=last_name]").attr('title', '');
    }

    if (!$('input[name=email]').val()) {
        $("input[name=email]").parent().css('border', '2px solid red');
        $("input[name=email]").attr('title', 'Email is required');
        valid = false;
    } else {
        email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        if (!email_regex.test($('input[name=email]').val())) {
            $("input[name=email]").parent().css('border', '2px solid red');
            $("input[name=email]").attr('title', 'Email is not valid');
            valid = false;
        } else {
            $("input[name=email]").parent().css('border', '1px solid #d2d3d4');
            $("input[name=email]").attr('title', '');
        }
    }

    if (!$('input[name=phone_number]').val()) {
        $("input[name=phone_number]").parent().css('border', '2px solid red');
        $("input[name=phone_number]").attr('title', 'Phone number is required');
        valid = false;
    } else {
        $("input[name=phone_number]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=phone_number]").attr('title', '');
    }

    if (!$('input[name=dob]').val()) {
        $("input[name=dob]").parent().css('border', '2px solid red');
        $("input[name=dob]").attr('title', 'DOB is required');
        valid = false;
    } else {
        $("input[name=dob]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=dob]").attr('title', '');
    }

    if (!$('input[name=gender]').is(':checked')) {
        $("input[name=gender]").parent().css('border', '2px solid red');
        $("input[name=gender]").attr('title', 'Gender is required');
        valid = false;
    } else {
        $("input[name=gender]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=gender]").attr('title', '');
    }

    if (!$('input[id=MaritalStatus_input]').val()) {
        $("input[id=MaritalStatus_input]").parent().css('border', '2px solid red');
        $("input[id=MaritalStatus_input]").attr('title', 'Marital status is required');
        valid = false;
    } else {
        $('#marital_status').val($('input[id=MaritalStatus_input]').attr("data-id"));
        $("input[id=MaritalStatus_input]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=MaritalStatus_input]").attr('title', '');
    }

    if (!$('input[id=EduList_input]').val()) {
        $("input[id=EduList_input]").parent().css('border', '2px solid red');
        $("input[id=EduList_input]").attr('title', 'Education is required');
        valid = false;
    } else {
        $("input[id=EduList_input]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=EduList_input]").attr('title', '');
    }

    if (!$('input[id=WorkIndustryList_input]').val()) {
        $("input[id=WorkIndustryList_input]").parent().css('border', '2px solid red');
        $("input[id=WorkIndustryList_input]").attr('title', 'Work industry is required');
        valid = false;
    } else {
        $("input[id=WorkIndustryList_input]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=WorkIndustryList_input]").attr('title', '');
    }

    if (!$('input[id=JobTitleList_input]').val()) {
        $("input[id=JobTitleList_input]").parent().css('border', '2px solid red');
        $("input[id=JobTitleList_input]").attr('title', 'Job title is required');
        valid = false;
    } else {
        $("input[id=JobTitleList_input]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=JobTitleList_input]").attr('title', '');
    }

    if (valid == true) {
        $('#homeInsuranceFloaterForm').submit();
    }
    return valid;
}
/**** Home Insurance Floater Page Validation End ****/

/**** Motor Cycle Insurance Page Validation End ****/
function validateMotorCycleInsuranceForm() {
    var valid = true;
    if (!$('input[name=first_name]').val()) {
        $("input[name=first_name]").parent().css('border', '2px solid red');
        $("input[name=first_name]").attr('title', 'First name is required');
        valid = false;
    } else {
        $("input[name=first_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=first_name]").attr('title', '');
    }

    if (!$('input[name=last_name]').val()) {
        $("input[name=last_name]").parent().css('border', '2px solid red');
        $("input[name=last_name]").attr('title', 'Last name is required');
        valid = false;
    } else {
        $("input[name=last_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=last_name]").attr('title', '');
    }

    if (!$('input[name=email]').val()) {
        $("input[name=email]").parent().css('border', '2px solid red');
        $("input[name=email]").attr('title', 'Email is required');
        valid = false;
    } else {
        email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        if (!email_regex.test($('input[name=email]').val())) {
            $("input[name=email]").parent().css('border', '2px solid red');
            $("input[name=email]").attr('title', 'Email is not valid');
            valid = false;
        } else {
            $("input[name=email]").parent().css('border', '1px solid #d2d3d4');
            $("input[name=email]").attr('title', '');
        }
    }

    if (!$('input[name=phone_number]').val()) {
        $("input[name=phone_number]").parent().css('border', '2px solid red');
        $("input[name=phone_number]").attr('title', 'Phone number is required');
        valid = false;
    } else {
        $("input[name=phone_number]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=phone_number]").attr('title', '');
    }

    if (!$('input[name=address_line1]').val()) {
        $("input[name=address_line1]").parent().css('border', '2px solid red');
        $("input[name=address_line1]").attr('title', 'Address is required');
        valid = false;
    } else {
        $("input[name=address_line1]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=address_line1]").attr('title', '');
    }

    if (!$('input[id=StateList_input]').val()) {
        $("input[id=StateList_input]").parent().css('border', '2px solid red');
        $("input[id=StateList_input]").attr('title', 'State is required');
        valid = false;
    } else {
        $('#state_id').val($('input[id=StateList_input]').attr("data-id"));
        $("input[id=StateList_input]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=StateList_input]").attr('title', '');
    }

    if (!$('input[name=city]').val()) {
        $("input[name=city]").parent().css('border', '2px solid red');
        $("input[name=city]").attr('title', 'City is required');
        valid = false;
    } else {
        $("input[name=city]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=city]").attr('title', '');
    }

    if (!$('input[name=zipcode]').val()) {
        $("input[name=zipcode]").parent().css('border', '2px solid red');
        $("input[name=zipcode]").attr('title', 'Zipcode is required');
        valid = false;
    } else {
        $("input[name=zipcode]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=zipcode]").attr('title', '');
    }

    var vehicle_type = document.getElementsByName('vehicle_type[]');
    $.each(vehicle_type, function(i, val) {
        if (!$(this).val()) {
            $(this).parent().css('border', '2px solid red');
            $(this).attr('title', 'Vehicle is required');
            valid = false;
        } else {
            $(this).parent().css('border', '1px solid #d2d3d4');
            $(this).attr('title', '');
        }
    });

    var message = document.getElementsByName('message[]');
    $.each(message, function(i, val) {
        if (!$(this).val()) {
            $(this).parent().css('border', '2px solid red');
            $(this).attr('title', 'Message is required');
            valid = false;
        } else {
            $(this).parent().css('border', '1px solid #d2d3d4');
            $(this).attr('title', '');
        }
    });

    if (valid == true) {
        $('#motorCycleInsuranceForm').submit();
    }
    return valid;
}
/**** Motor Cycle Insurance Page Validation End ****/

/**** Umbrella Insurance Page Validation End ****/
function validateUmbrellaInsuranceForm() {
    var valid = true;
    if (!$('input[name=first_name]').val()) {
        $("input[name=first_name]").parent().css('border', '2px solid red');
        $("input[name=first_name]").attr('title', 'First name is required');
        valid = false;
    } else {
        $("input[name=first_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=first_name]").attr('title', '');
    }

    if (!$('input[name=last_name]').val()) {
        $("input[name=last_name]").parent().css('border', '2px solid red');
        $("input[name=last_name]").attr('title', 'Last name is required');
        valid = false;
    } else {
        $("input[name=last_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=last_name]").attr('title', '');
    }

    if (!$('input[name=email]').val()) {
        $("input[name=email]").parent().css('border', '2px solid red');
        $("input[name=email]").attr('title', 'Email is required');
        valid = false;
    } else {
        email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        if (!email_regex.test($('input[name=email]').val())) {
            $("input[name=email]").parent().css('border', '2px solid red');
            $("input[name=email]").attr('title', 'Email is not valid');
            valid = false;
        } else {
            $("input[name=email]").parent().css('border', '1px solid #d2d3d4');
            $("input[name=email]").attr('title', '');
        }
    }

    if (!$('input[name=phone_number]').val()) {
        $("input[name=phone_number]").parent().css('border', '2px solid red');
        $("input[name=phone_number]").attr('title', 'Phone number is required');
        valid = false;
    } else {
        $("input[name=phone_number]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=phone_number]").attr('title', '');
    }

    if (!$('input[name=address_line1]').val()) {
        $("input[name=address_line1]").parent().css('border', '2px solid red');
        $("input[name=address_line1]").attr('title', 'Address is required');
        valid = false;
    } else {
        $("input[name=address_line1]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=address_line1]").attr('title', '');
    }

    if (!$('input[id=StateList_input]').val()) {
        $("input[id=StateList_input]").parent().css('border', '2px solid red');
        $("input[id=StateList_input]").attr('title', 'State is required');
        valid = false;
    } else {
        $('#state_id').val($('input[id=StateList_input]').attr("data-id"));
        $("input[id=StateList_input]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=StateList_input]").attr('title', '');
    }

    if (!$('input[name=city]').val()) {
        $("input[name=city]").parent().css('border', '2px solid red');
        $("input[name=city]").attr('title', 'City is required');
        valid = false;
    } else {
        $("input[name=city]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=city]").attr('title', '');
    }

    if (!$('input[name=zipcode]').val()) {
        $("input[name=zipcode]").parent().css('border', '2px solid red');
        $("input[name=zipcode]").attr('title', 'Zipcode is required');
        valid = false;
    } else {
        $("input[name=zipcode]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=zipcode]").attr('title', '');
    }

    if (valid == true) {
        $('#umbrellaInsuranceForm').submit();
    }
    return valid;
}
/**** Umbrella Insurance Page Validation End ****/

/**** Group Benifits Insurance Page Validation End ****/
function validateGroupBenifitsInsuranceForm() {
    var valid = true;
    if (!$('input[name=first_name]').val()) {
        $("input[name=first_name]").parent().css('border', '2px solid red');
        $("input[name=first_name]").attr('title', 'First name is required');
        valid = false;
    } else {
        $("input[name=first_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=first_name]").attr('title', '');
    }

    if (!$('input[name=last_name]').val()) {
        $("input[name=last_name]").parent().css('border', '2px solid red');
        $("input[name=last_name]").attr('title', 'Last name is required');
        valid = false;
    } else {
        $("input[name=last_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=last_name]").attr('title', '');
    }

    if (!$('input[name=email]').val()) {
        $("input[name=email]").parent().css('border', '2px solid red');
        $("input[name=email]").attr('title', 'Email is required');
        valid = false;
    } else {
        email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        if (!email_regex.test($('input[name=email]').val())) {
            $("input[name=email]").parent().css('border', '2px solid red');
            $("input[name=email]").attr('title', 'Email is not valid');
            valid = false;
        } else {
            $("input[name=email]").parent().css('border', '1px solid #d2d3d4');
            $("input[name=email]").attr('title', '');
        }
    }

    if (!$('input[name=phone_number]').val()) {
        $("input[name=phone_number]").parent().css('border', '2px solid red');
        $("input[name=phone_number]").attr('title', 'Phone number is required');
        valid = false;
    } else {
        $("input[name=phone_number]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=phone_number]").attr('title', '');
    }

    if (!$('input[name=company_name]').val()) {
        $("input[name=company_name]").parent().css('border', '2px solid red');
        $("input[name=company_name]").attr('title', 'Company name is required');
        valid = false;
    } else {
        $("input[name=company_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=company_name]").attr('title', '');
    }

    if (valid == true) {
        $('#groupBenifitsInsuranceForm').submit();
    }
    return valid;
}
/**** Group Benifits Insurance Page Validation End ****/

/**** Life Insurance Validation Start ****/
function validateLifeInsuranceForm() {
    var valid = true;
    if (!$('input[name=first_name]').val()) {
        $("input[name=first_name]").parent().css('border', '2px solid red');
        $("input[name=first_name]").attr('title', 'First name is required');
        valid = false;
    } else {
        $("input[name=first_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=first_name]").attr('title', '');
    }

    if (!$('input[name=last_name]').val()) {
        $("input[name=last_name]").parent().css('border', '2px solid red');
        $("input[name=last_name]").attr('title', 'Last name is required');
        valid = false;
    } else {
        $("input[name=last_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=last_name]").attr('title', '');
    }

    if (!$('input[name=email]').val()) {
        $("input[name=email]").parent().css('border', '2px solid red');
        $("input[name=email]").attr('title', 'Email is required');
        valid = false;
    } else {
        email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        if (!email_regex.test($('input[name=email]').val())) {
            $("input[name=email]").parent().css('border', '2px solid red');
            $("input[name=email]").attr('title', 'Email is not valid');
            valid = false;
        } else {
            $("input[name=email]").parent().css('border', '1px solid #d2d3d4');
            $("input[name=email]").attr('title', '');
        }
    }

    if (!$('input[name=phone_number]').val()) {
        $("input[name=phone_number]").parent().css('border', '2px solid red');
        $("input[name=phone_number]").attr('title', 'Phone number is required');
        valid = false;
    } else {
        $("input[name=phone_number]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=phone_number]").attr('title', '');
    }

    if (!$('input[name=dob]').val()) {
        $("input[name=dob]").parent().css('border', '2px solid red');
        $("input[name=dob]").attr('title', 'DOB is required');
        valid = false;
    } else {
        $("input[name=dob]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=dob]").attr('title', '');
    }

    if (!$('input[name=gender]').is(':checked')) {
        $("input[name=gender]").parent().css('border', '2px solid red');
        $("input[name=gender]").attr('title', 'Gender is required');
        valid = false;
    } else {
        $("input[name=gender]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=gender]").attr('title', '');
    }

    if (!$('input[name=address_line1]').val()) {
        $("input[name=address_line1]").parent().css('border', '2px solid red');
        $("input[name=address_line1]").attr('title', 'Address is required');
        valid = false;
    } else {
        $("input[name=address_line1]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=address_line1]").attr('title', '');
    }

    if (!$('input[id=StateList_input]').val()) {
        $("input[id=StateList_input]").parent().css('border', '2px solid red');
        $("input[id=StateList_input]").attr('title', 'State is required');
        valid = false;
    } else {
        $('#state_id').val($('input[id=StateList_input]').attr("data-id"));
        $("input[id=StateList_input]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=StateList_input]").attr('title', '');
    }

    if (!$('input[name=city]').val()) {
        $("input[name=city]").parent().css('border', '2px solid red');
        $("input[name=city]").attr('title', 'City is required');
        valid = false;
    } else {
        $("input[name=city]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=city]").attr('title', '');
    }

    if (!$('input[name=zipcode]').val()) {
        $("input[name=zipcode]").parent().css('border', '2px solid red');
        $("input[name=zipcode]").attr('title', 'Zipcode is required');
        valid = false;
    } else {
        $("input[name=zipcode]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=zipcode]").attr('title', '');
    }

    if (!$('input[id=CoverageAmtList_input]').val()) {
        $("input[id=CoverageAmtList_input]").parent().css('border', '2px solid red');
        $("input[id=CoverageAmtList_input]").attr('title', 'Coverage amount is required');
        valid = false;
    } else {
        $('#coverage_amt').val($('input[id=CoverageAmtList_input]').attr("data-id"));
        $("input[id=CoverageAmtList_input]").parent().css('border', '1px solid #d2d3d4');
        $("input[id=CoverageAmtList_input]").attr('title', '');
    }

    if (!$('input[name=contain_nicotine]').is(':checked')) {
        $("input[name=contain_nicotine]").parent().css('border', '2px solid red');
        $("input[name=contain_nicotine]").attr('title', 'Use products that contain nicotine is required');
        valid = false;
    } else {
        $("input[name=contain_nicotine]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=contain_nicotine]").attr('title', '');
    }

    if (valid == true) {
        $('#lifeInsuranceForm').submit();
    }
    return valid;
}
/**** Life Insurance Page Validation End ****/

/**** Midcare Insurance Page Validation Start ****/
function validateMidcareInsuranceForm() {
    var valid = true;

    if (!$('input[name=coverage_type]').is(':checked')) {
        $("input[name=coverage_type]").parent().css('border', '2px solid red');
        $("input[name=coverage_type]").attr('title', 'Coverage type is required');
        valid = false;
    } else {
        $("input[name=coverage_type]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=coverage_type]").attr('title', '');
    }

    if (!$('input[name=first_name]').val()) {
        $("input[name=first_name]").parent().css('border', '2px solid red');
        $("input[name=first_name]").attr('title', 'First name is required');
        valid = false;
    } else {
        $("input[name=first_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=first_name]").attr('title', '');
    }

    if (!$('input[name=last_name]').val()) {
        $("input[name=last_name]").parent().css('border', '2px solid red');
        $("input[name=last_name]").attr('title', 'Last name is required');
        valid = false;
    } else {
        $("input[name=last_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=last_name]").attr('title', '');
    }

    if (!$('input[name=email]').val()) {
        $("input[name=email]").parent().css('border', '2px solid red');
        $("input[name=email]").attr('title', 'Email is required');
        valid = false;
    } else {
        email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        if (!email_regex.test($('input[name=email]').val())) {
            $("input[name=email]").parent().css('border', '2px solid red');
            $("input[name=email]").attr('title', 'Email is not valid');
            valid = false;
        } else {
            $("input[name=email]").parent().css('border', '1px solid #d2d3d4');
            $("input[name=email]").attr('title', '');
        }
    }

    if (!$('input[name=phone_number]').val()) {
        $("input[name=phone_number]").parent().css('border', '2px solid red');
        $("input[name=phone_number]").attr('title', 'Phone number is required');
        valid = false;
    } else {
        $("input[name=phone_number]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=phone_number]").attr('title', '');
    }

    if (!$('input[name=dob]').val()) {
        $("input[name=dob]").parent().css('border', '2px solid red');
        $("input[name=dob]").attr('title', 'DOB is required');
        valid = false;
    } else {
        $("input[name=dob]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=dob]").attr('title', '');
    }

    if (!$('input[name=gender]').is(':checked')) {
        $("input[name=gender]").parent().css('border', '2px solid red');
        $("input[name=gender]").attr('title', 'Gender is required');
        valid = false;
    } else {
        $("input[name=gender]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=gender]").attr('title', '');
    }

    if (!$('input[name=zipcode]').val()) {
        $("input[name=zipcode]").parent().css('border', '2px solid red');
        $("input[name=zipcode]").attr('title', 'Zipcode is required');
        valid = false;
    } else {
        $("input[name=zipcode]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=zipcode]").attr('title', '');
    }

    if (valid == true) {
        $('#midcareInsuranceForm').submit();
    }
    return valid;
}
/**** Midcare Insurance Page Validation End ****/

/**** Health Insurance Page Validation Start ****/
function validateHealthInsuranceForm() {
    var valid = true;

    if (!$('input[name=coverage_type]').is(':checked')) {
        $("input[name=coverage_type]").parent().css('border', '2px solid red');
        $("input[name=coverage_type]").attr('title', 'Coverage type is required');
        valid = false;
    } else {
        $("input[name=coverage_type]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=coverage_type]").attr('title', '');
    }

    if (!$('input[name=cover_type]').is(':checked')) {
        $("input[name=cover_type]").parent().css('border', '2px solid red');
        $("input[name=cover_type]").attr('title', 'Cover type is required');
        valid = false;
    } else {
        $("input[name=cover_type]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=cover_type]").attr('title', '');
    }

    if (!$('input[name=first_name]').val()) {
        $("input[name=first_name]").parent().css('border', '2px solid red');
        $("input[name=first_name]").attr('title', 'First name is required');
        valid = false;
    } else {
        $("input[name=first_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=first_name]").attr('title', '');
    }

    if (!$('input[name=last_name]').val()) {
        $("input[name=last_name]").parent().css('border', '2px solid red');
        $("input[name=last_name]").attr('title', 'Last name is required');
        valid = false;
    } else {
        $("input[name=last_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=last_name]").attr('title', '');
    }

    if (!$('input[name=email]').val()) {
        $("input[name=email]").parent().css('border', '2px solid red');
        $("input[name=email]").attr('title', 'Email is required');
        valid = false;
    } else {
        email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        if (!email_regex.test($('input[name=email]').val())) {
            $("input[name=email]").parent().css('border', '2px solid red');
            $("input[name=email]").attr('title', 'Email is not valid');
            valid = false;
        } else {
            $("input[name=email]").parent().css('border', '1px solid #d2d3d4');
            $("input[name=email]").attr('title', '');
        }
    }

    if (!$('input[name=phone_number]').val()) {
        $("input[name=phone_number]").parent().css('border', '2px solid red');
        $("input[name=phone_number]").attr('title', 'Phone number is required');
        valid = false;
    } else {
        $("input[name=phone_number]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=phone_number]").attr('title', '');
    }

    if (!$('input[name=dob]').val()) {
        $("input[name=dob]").parent().css('border', '2px solid red');
        $("input[name=dob]").attr('title', 'DOB is required');
        valid = false;
    } else {
        $("input[name=dob]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=dob]").attr('title', '');
    }

    if (!$('input[name=gender]').is(':checked')) {
        $("input[name=gender]").parent().css('border', '2px solid red');
        $("input[name=gender]").attr('title', 'Gender is required');
        valid = false;
    } else {
        $("input[name=gender]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=gender]").attr('title', '');
    }

    if (!$('input[name=zipcode]').val()) {
        $("input[name=zipcode]").parent().css('border', '2px solid red');
        $("input[name=zipcode]").attr('title', 'Zipcode is required');
        valid = false;
    } else {
        $("input[name=zipcode]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=zipcode]").attr('title', '');
    }

    if (!$('input[name=gender]').is(':checked')) {
        $("input[name=gender]").parent().css('border', '2px solid red');
        $("input[name=gender]").attr('title', 'Gender is required');
        valid = false;
    } else {
        $("input[name=gender]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=gender]").attr('title', '');
    }

    var child_dob = document.getElementsByName('child_dob[]');
    $.each(child_dob, function(i, val) {
        if (!$(this).val()) {
            $(this).parent().css('border', '2px solid red');
            $(this).attr('title', 'DOB is required');
            valid = false;
        } else {
            $(this).parent().css('border', '1px solid #d2d3d4');
            $(this).attr('title', '');
        }
    });
    var child_gender = document.getElementsByName('child_gender[]');
    /*$.each(child_gender, function (i, val) {
     if (!$(this).is(':checked')) {
     $(this).parent().css('border', '2px solid red');
     $(this).attr('title', 'Gender is required');
     valid = false;
     } else {
     $(this).parent().css('border', '1px solid #d2d3d4');
     $(this).attr('title', '');
     }
     });*/

    if (valid == true) {
        $('#healthInsuranceForm').submit();
    }
    return valid;



}
/**** Health Insurance Page Validation End ****/

/**** Insurance Form Start ****/

function validateForm() {
    var valid = true;
    if ($("input[name=question]").length > 0 && !$("input[name=question]").val()) {
        $("input[name=question]").parent().css('border', '2px solid red');
        $("input[name=question]").attr('title', 'Please select question');
        valid = false;
    } else {
        $("input[name=question]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=question]").attr('title', '');
    }
    if ($("input[name=web_link]").length > 0 && !$("input[name=web_link]").val()) {
        $("input[name=web_link]").parent().css('border', '2px solid red');
        $("input[name=web_link]").attr('title', 'Please select question');
        valid = false;
    } else {
        $("input[name=web_link]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=web_link]").attr('title', '');
    }
    if ($("input[name=first_name]").length > 0 && !$("input[name=first_name]").val()) {
        $("input[name=first_name]").parent().css('border', '2px solid red');
        $("input[name=first_name]").attr('title', 'Please enter first name');
        valid = false;
    } else {
        $("input[name=first_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=first_name]").attr('title', '');
    }
    if ($("input[name=last_name]").length > 0 && !$("input[name=last_name]").val()) {
        $("input[name=last_name]").parent().css('border', '2px solid red');
        $("input[name=last_name]").attr('title', 'Please enter last number ');
        valid = false;
    } else {
        $("input[name=last_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=last_name]").attr('title', '');
    }
    if ($("select[name=type]").length > 0 && !$("select[name=type]").val()) {
        $("select[name=type]").parent().css('border', '2px solid red');
        $("select[name=type]").attr('title', 'Please enter last number ');
        valid = false;
    } else {
        $("select[name=type]").parent().css('border', '1px solid #d2d3d4');
        $("select[name=type]").attr('title', '');
    }
    if ($("input[name=phone_number]").length > 0 && !$("input[name=phone_number]").val()) {
        $("input[name=phone_number]").parent().css('border', '2px solid red');
        $("input[name=phone_number]").attr('title', 'Please enter contact number ');
        valid = false;
    } else {
        $("input[name=phone_number]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=phone_number]").attr('title', '');
    }
    if ($('input[name=email]').length > 0 && !$('input[name=email]').val()) {
        $("input[name=email]").parent().css('border', '2px solid red');
        $("input[name=email]").attr('title', 'Please enter email');
        valid = false;
    } else {
        email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        if (!email_regex.test($('input[name=email]').val())) {
            $("input[name=email]").parent().css('border', '2px solid red');
            $("input[name=email]").attr('title', 'Please enter a valid email');
            valid = false;
        } else {
            $("input[name=email]").parent().css('border', '1px solid #d2d3d4');
            $("input[name=email]").attr('title', '');
        }
    }
    if (valid == true) {
        $('#insurance-form').submit();
    }
    return valid;
}

function validateClaimForm() {
    var valid = true;
    if ($("input[name=type]").length > 0 && !$("input[name=type]").val()) {
        $("input[name=type]").parent().css('border', '2px solid red');
        $("input[name=type]").attr('title', 'Please select insurance');
        valid = false;
    } else {
        $("input[name=type]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=type]").attr('title', '');
    }
    if ($("textarea[name=description]").length > 0 && !$("textarea[name=description]").val()) {
        $("textarea[name=description]").parent().css('border', '2px solid red');
        $("textarea[name=description]").attr('title', 'Please select insurance');
        valid = false;
    } else {
        $("textarea[name=description]").parent().css('border', '1px solid #d2d3d4');
        $("textarea[name=description]").attr('title', '');
    }
    if ($("input[name=date]").length > 0 && !$("input[name=date]").val()) {
        $("input[name=date]").parent().css('border', '2px solid red');
        $("input[name=date]").attr('title', 'Please select question');
        valid = false;
    } else {
        $("input[name=date]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=date]").attr('title', '');
    }
    if ($("input[name=first_name]").length > 0 && !$("input[name=first_name]").val()) {
        $("input[name=first_name]").parent().css('border', '2px solid red');
        $("input[name=first_name]").attr('title', 'Please enter first name');
        valid = false;
    } else {
        $("input[name=first_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=first_name]").attr('title', '');
    }
    if ($("input[name=last_name]").length > 0 && !$("input[name=last_name]").val()) {
        $("input[name=last_name]").parent().css('border', '2px solid red');
        $("input[name=last_name]").attr('title', 'Please enter last number ');
        valid = false;
    } else {
        $("input[name=last_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=last_name]").attr('title', '');
    }
    if ($("input[name=phone_number]").length > 0 && !$("input[name=phone_number]").val()) {
        $("input[name=phone_number]").parent().css('border', '2px solid red');
        $("input[name=phone_number]").attr('title', 'Please enter contact number ');
        valid = false;
    } else {
        $("input[name=phone_number]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=phone_number]").attr('title', '');
    }
    if ($('input[name=email]').length > 0 && !$('input[name=email]').val()) {
        $("input[name=email]").parent().css('border', '2px solid red');
        $("input[name=email]").attr('title', 'Please enter email');
        valid = false;
    } else {
        email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        if (!email_regex.test($('input[name=email]').val())) {
            $("input[name=email]").parent().css('border', '2px solid red');
            $("input[name=email]").attr('title', 'Please enter a valid email');
            valid = false;
        } else {
            $("input[name=email]").parent().css('border', '1px solid #d2d3d4');
            $("input[name=email]").attr('title', '');
        }
    }
    if (valid == true) {
        $('#claim-form').submit();
    }
    return valid;
}

function validatecarrerForm() {
    var valid = true;
    if ($("input[name=experience]").length > 0 && !$("input[name=experience]").val()) {
        $("input[name=experience]").parent().css('border', '2px solid red');
        $("input[name=experience]").attr('title', 'Please enter experience');
        valid = false;
    } else {
        $("input[name=experience]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=experience]").attr('title', '');
    }
    if ($("input[name=image]").length > 0 && !$("input[name=image]").val()) {
        $("input[name=image]").parent().css('border', '2px solid red');
        $("input[name=image]").attr('title', 'Please choose an image');
        valid = false;
    } else {
        $("input[name=image]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=image]").attr('title', '');
    }
    if ($("input[name=position]").length > 0 && !$("input[name=position]").val()) {
        $("input[name=position]").parent().css('border', '2px solid red');
        $("input[name=position]").attr('title', 'Please enter position');
        valid = false;
    } else {
        $("input[name=position]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=position]").attr('title', '');
    }
    if ($("input[name=first_name]").length > 0 && !$("input[name=first_name]").val()) {
        $("input[name=first_name]").parent().css('border', '2px solid red');
        $("input[name=first_name]").attr('title', 'Please enter first name');
        valid = false;
    } else {
        $("input[name=first_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=first_name]").attr('title', '');
    }
    if ($("input[name=last_name]").length > 0 && !$("input[name=last_name]").val()) {
        $("input[name=last_name]").parent().css('border', '2px solid red');
        $("input[name=last_name]").attr('title', 'Please enter last name ');
        valid = false;
    } else {
        $("input[name=last_name]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=last_name]").attr('title', '');
    }
    if ($("input[name=phone_number]").length > 0 && !$("input[name=phone_number]").val()) {
        $("input[name=phone_number]").parent().css('border', '2px solid red');
        $("input[name=phone_number]").attr('title', 'Please enter contact number ');
        valid = false;
    } else {
        $("input[name=phone_number]").parent().css('border', '1px solid #d2d3d4');
        $("input[name=phone_number]").attr('title', '');
    }
    if ($('input[name=email]').length > 0 && !$('input[name=email]').val()) {
        $("input[name=email]").parent().css('border', '2px solid red');
        $("input[name=email]").attr('title', 'Please enter email');
        valid = false;
    } else {
        email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        if (!email_regex.test($('input[name=email]').val())) {
            $("input[name=email]").parent().css('border', '2px solid red');
            $("input[name=email]").attr('title', 'Please enter a valid email');
            valid = false;
        } else {
            $("input[name=email]").parent().css('border', '1px solid #d2d3d4');
            $("input[name=email]").attr('title', '');
        }
    }
    if (valid == true) {
        $('#Carrer-form').submit();
    }
    return valid;
}


/**** Insurance Form Start End ****/