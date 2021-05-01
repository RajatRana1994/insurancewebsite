$(function () {
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
        callback: function () {},
        // starting callback function before each string
        preStringTyped: function () {},
        //callback for every typed string
        onStringTyped: function () {},
        // callback for reset
        resetCallback: function () {}
    });
});

$(document).ready(function () {
    $('.nav-toggler').click(function () {
        $('.header').toggleClass('mobile-active');
    });
    $('.dropdown-select-header').click(function () {
        $(this).parent().toggleClass('show');
    });
    $('.dropdown-menu .item').click(function () {
        var htmlText = $(this).html();
        var id = $(this).parent().attr('id')
        $('#' + id + '_input').attr('value', htmlText);
        if ($(this).attr("data-id") != undefined) {
            var data_id = $(this).attr("data-id");
            $('#' + id + '_input').attr('data-id', data_id);
        }
        $('.dropdown-select.show').removeClass('show');

    });
    $('.question-wrap input:checkbox').change(function () {
        if ($(this).is(":checked")) {
            $(this).parents('.section-page-question-item').addClass("active-question");
            $('.scroll-wrap').animate({scrollTop: $('.scroll-wrap')[0].scrollHeight}, 1200);

        } else {
            $(this).parents('.section-page-question-item').removeClass("active-question");
        }
    });

    $('.step-btn').click(function () {
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
        responsive: [
            {
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

$(document).on('click', '.is-dropdown-submenu-parent', function () {
    $('.is-dropdown-submenu-parent').removeClass('active');
    $(this).addClass('active');
});

$(function () {
    var header = $(".header");
    $(window).scroll(function () {
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