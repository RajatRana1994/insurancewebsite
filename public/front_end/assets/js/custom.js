$(function() {
    $(".typed").typed({
        strings: ["Auto Insurance", "Home Insurance"],
        // Optionally use an HTML element to grab strings from (must wrap each string in a <p>)
        stringsElement: null,
        // typing speed
        typeSpeed: 30,
        // time before typing starts
        startDelay: 500,
        // backspacing speed
        backSpeed: 30,
        // time before backspacing
        backDelay: 2000,
        // loop
        loop: true,
        // false = infinite
        loopCount: 5,
        // show cursor
        showCursor: false,
        // character for cursor
        cursorChar: "|",
        // attribute to type (null == text)
        attr: null,
        // either html or text
        contentType: 'html',
        // call when done callback function
        callback: function() {},
        // starting callback function before each string
        preStringTyped: function() {},
        //callback for every typed string
        onStringTyped: function() {},
        // callback for reset
        resetCallback: function() {}
    });
});

$(document).on("click", ".dropdown-select-wrap", function() {
    $(this).parent().addClass('show');
});

$(document).on("click", ".dropdown-menu .item", function() {
    var htmlText = $(this).html().trim();
    var id = $(this).parent().attr('id')
    $('#' + id + '_input').attr('value', htmlText);
    if ($(this).attr("data-id") != undefined) {
        var data_id = $(this).attr("data-id");
        $('#' + id + '_input').attr('data-id', data_id);
    }
    if ($(this).parent().attr("data-function-name") != undefined) {
        if ($(this).parent().attr('data-function-name') == 'MakeList') {
            getMakeList('MakerList');
        }
        if ($(this).parent().attr('data-function-name') == 'ModelList') {
            getModelList('ModelList');
        }
        if ($(this).parent().attr('data-function-name') == 'MakeList1') {
            getMakeList('MakerList1');
        }
        if ($(this).parent().attr('data-function-name') == 'ModelList1') {
            getModelList('ModelList1');
        }
        if ($(this).parent().attr('data-function-name') == 'TrimList') {
            getTrimList('TrimList');
        }
        if ($(this).parent().attr('data-function-name') == 'TrimList1') {
            getTrimList('TrimList1');
        }
    }
    $('.dropdown-select.show').removeClass('show');
});

$(document).ready(function() {
    $('.nav-toggler').click(function() {
        $('.header').toggleClass('mobile-active');
    });
    $('.dropdown-select-header').click(function() {
        $(this).parent().toggleClass('show');
    });
    $('.dropdown-menu .item').click(function() {
        var htmlText = $(this).html().trim();;
        var id = $(this).parent().attr('id')
        $('#' + id + '_input').attr('value', htmlText);
        if ($(this).attr("data-id") != undefined) {
            var data_id = $(this).attr("data-id");
            $('#' + id + '_input').attr('data-id', data_id);
        }
        $('.dropdown-select.show').removeClass('show');
    });
    $('.question-wrap input:checkbox').change(function() {
        if ($(this).is(":checked")) {
            $(this).parents('.section-page-question-item').addClass("active-question");
            $('.scroll-wrap').animate({ scrollTop: $('.scroll-wrap')[0].scrollHeight }, 1200);
        } else {
            $(this).parents('.section-page-question-item').removeClass("active-question");
        }
    });

    $('.step-btn').click(function() {
        if ($(this).attr('show-step') != "") {
            var id = $(this).attr('show-step');
            $('#' + id).addClass('active');
            $(this).parents('.section-wrapper').removeClass('active');
        }
    });

    $('.testimonial-slider').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        dots: true,
        arrows: false,
        responsive: [{
                breakpoint: 1199,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });
});

$(document).on('click', '.is-dropdown-submenu-parent', function() {
    $('.is-dropdown-submenu-parent').removeClass('active');
    $(this).addClass('active');
});

$(function() {
    var header = $(".header");
    $(window).scroll(function() {
        var scroll = $(window).scrollTop();

        if (scroll >= 500) {
            header.addClass("darkHeader");
            $('.call-us').addClass('show-cta');
        } else {
            header.removeClass("darkHeader");
            $('.call-us').removeClass('show-cta');
        }
    });
});

$(document).on('click', '.birthdate', function() {
    $(this).attr("type", 'date');
    $(this).parent().parent().addClass('form-field--is-filled');
});

$(document).on('blur', '.birthdate', function() {
    $(this).attr("type", 'date');
    $(this).parent().parent().addClass('form-field--is-filled');
});

$(document).on('click', '.form-field__textarea', function() {
    $(this).parent().parent().addClass('form-field--is-filled');
});

$(document).on('blur', '.form-field__textarea', function() {
    $(this).parent().parent().addClass('form-field--is-filled');
});
$(document).on('click', '.agent_search_field button.btn', function() {
    $('.agent_search_field button.btn').removeClass('btn-black');
    $(this).addClass("btn-black");
    var searchVal = $(this).attr('data-search');
    $('#search_by').val(searchVal);
    if (searchVal == "byState") {
        $('#searchByName').css('display', 'none');
        $('#searchByState').css('display', 'block');
    }
    // if ($(searchVal) == "byName")
    else {
        $('#searchByName').css('display', 'block');
        $('#searchByState').css('display', 'none');
    }
});

$(document).on("click", "#findMyQuote", function() {
    if($(this).attr("data-agentID") && $(this).attr("data-agentID")!=""){
        window.location.href = "/"+$("#productInput").val()+"?agentID="+$(this).attr('data-agentID')
    }else{
        if ($("#productInput").val() != "") {
            window.location.href = "/"+$("#productInput").val().toLowerCase()
        } else {
            $("#productInput").css('border', '2px solid red')
        }
    }
})