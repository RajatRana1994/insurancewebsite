/*----- Loader -----*/
setTimeout(function(){
	$(".givebackrx-transition-loader").hide(2000);
},2000);


/*----- Our Biggest Fan Slider -----*/
$("#biggest_fan_slider").owlCarousel({
	items: 1,
	autoplay: false,
	autoplayTimeout: 4000,
	smartSpeed: 2000,
	lazyLoad: true,
	navigation: true,
	dots: false,
	nav: true,
	navText: ["<i class='fa fa-chevron-left'></i>","<i class='fa fa-chevron-right'></i>"],
	loop: true
});

/*----- Similar Product Slider -----*/
$("#similar_product_slider").owlCarousel({
	items: 4,
	autoplay: false,
	autoplayTimeout: 4000,
	smartSpeed: 2000,
	lazyLoad: true,
	navigation: true,
	dots: false,
	nav: true,
	navText: ["<i class='fa fa-chevron-left'></i>","<i class='fa fa-chevron-right'></i>"],
	loop: true,
	responsive : {
	0 : {
        items: 1,
    },
    575 : {
        items: 2,
    },
    767 : {
        items: 3,
    },
    991 : {
        items: 4,
    }
}
});

/*----- Mobile Toggle Menu -----*/
$('.close-btn, .overlay').on('click', function () {
  $('.navbar-collapse').removeClass('show');
  $('.overlay').removeClass('active');
  jQuery('body').removeClass('bodyactive');
});
$('.navbar-toggler').on('click', function () {
  $('.overlay').addClass('active');
  jQuery('body').addClass('bodyactive');
});

/*----- Dashboard Mobile Menu ------*/
function openNav() {
  document.getElementById("mobile_adminnav").style.width = "240px";
}
function closeNav() {
  document.getElementById("mobile_adminnav").style.width = "0";
}

/*----- Admin Mobile Menu -----*/
$(window).scroll(function() {    
    var scroll = $(window).scrollTop();

    if (scroll >= 1) {
        $(".custom-header").addClass("sticky-header");
    } else {
        $(".custom-header").removeClass("sticky-header");
    }
});

/*----- Click on Menu then Scroll -----*/
var $root = $('html, body');
$('a[href^="#"]').click(function () {
  $root.animate({
    scrollTop: $($.attr(this, 'href')).offset().top - 30
  }, 1600);
  return false;
});



$("body.privacy_body").scrollTop(4050);
