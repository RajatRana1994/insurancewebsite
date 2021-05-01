$(".leave_btn, .enter_btn").click(function(){
  $("#welcome_popup").hide();
});

$(".sign_escort, .sign_client").click(function(){
  $("#sign_upas").hide();
});

$(".sign_inner").click(function(){
  $(".modal-backdrop ").hide();
});
 
function openNav() {
  document.getElementById("mobile_nav").style.width = "70px";
}

function closeNav() {
  document.getElementById("mobile_nav").style.width = "0";
}



$("#card_slider").owlCarousel({
	autoplay: false,
	autoplayTimeout: 4000,
	smartSpeed: 2000,
	lazyLoad: true,
	margin: 10,
	stagePadding: 120,
	navigation: true,
	dots: false,
	nav: true,
	navText: ["<i class='fa fa-chevron-left'></i>","<i class='fa fa-chevron-right'></i>"],
	loop: true,
	responsiveClass: true,
	responsive: {
		0: {
			items: 1,
			nav: false,
			stagePadding: 0,
		},
		500: {
			items: 2,
			nav: false,
			stagePadding: 0,
		},
		700: {
			items: 2,
			nav: false,
		},
		991: {
			items: 3,
			nav: true,
		},
		1200: {
			items: 4,
			nav: true,
		}
	}
});

$("#room_slider").owlCarousel({
	autoplay: false,
	items: 1,
	autoplayTimeout: 4000,
	smartSpeed: 2000,
	lazyLoad: true,
	navigation: true,
	dots: true,
	nav: false,
	navText: ["<i class='fa fa-chevron-left'></i>","<i class='fa fa-chevron-right'></i>"],
	loop: true,
	responsiveClass: true,
});

$("#blacklist_client_slider").owlCarousel({
	autoplay: false,
	items: 4,
	autoplayTimeout: 4000,
	smartSpeed: 2000,
	lazyLoad: true,
	navigation: true,
	dots: true,
	nav: false,
	navText: ["<i class='fa fa-chevron-left'></i>","<i class='fa fa-chevron-right'></i>"],
	loop: true,
	responsiveClass: true,
	responsive: {
		0: {
			items: 1,
			nav: false,
			stagePadding: 0,
		},
		700: {
			items: 2,
			nav: false,
		},
		991: {
			items: 3,
			nav: true,
		},
		1200: {
			items: 4,
			nav: true,
		}
	}
});





var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

function showTab(n) {
  // This function will display the specified tab of the form...
  var x = document.getElementsByClassName("tab");
  x[n].style.display = "block";
  //... and fix the Previous/Next buttons:
  if (n == 0) {
    document.getElementById("prevBtn").style.display = "none";
  } else {
    document.getElementById("prevBtn").style.display = "inline";
  }
  if (n == (x.length - 1)) {
    document.getElementById("nextBtn").innerHTML = "Submit";
  } else {
    document.getElementById("nextBtn").innerHTML = "Next";
  }
  //... and run a function that will display the correct step indicator:
  fixStepIndicator(n)
}

function nextPrev(n) {
  // This function will figure out which tab to display
  var x = document.getElementsByClassName("tab");
  // Exit the function if any field in the current tab is invalid:
  if (n == 1 && !validateForm()) return false;
  // Hide the current tab:
  x[currentTab].style.display = "none";
  // Increase or decrease the current tab by 1:
  currentTab = currentTab + n;
  // if you have reached the end of the form...
  if (currentTab >= x.length) {
    // ... the form gets submitted:
    document.getElementById("regForm").submit();
    return false;
  }
  // Otherwise, display the correct tab:
  showTab(currentTab);
}

function validateForm() {
  // This function deals with validation of the form fields
  var x, y, i, valid = true;
  x = document.getElementsByClassName("tab");
  y = x[currentTab].getElementsByTagName("input");
  // A loop that checks every input field in the current tab:
  for (i = 0; i < y.length; i++) {
    // If a field is empty...
    if (y[i].value == "") {
      // add an "invalid" class to the field:
      y[i].className += " invalid";
      // and set the current valid status to false
      valid = false;
    }
  }
  // If the valid status is true, mark the step as finished and valid:
  if (valid) {
    document.getElementsByClassName("step")[currentTab].className += " finish";
  }
  return valid; // return the valid status
}

function fixStepIndicator(n) {
  // This function removes the "active" class of all steps...
  var i, x = document.getElementsByClassName("step");
  for (i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "");
  }
  //... and adds the "active" class on the current step:
  x[n].className += " active";
}

