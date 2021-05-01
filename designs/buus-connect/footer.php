		</div>
	</div>
	
	<div class="overlay"></div>
	
	<!-- jQuery first, then Popper.js, then Bootstrap JS -->
	<script src="assets/js/jquery.min.js"></script>
    <script src="assets/js/popper.min.js"></script>
    <script src="assets/js/bootstrap.min.js"></script>
	<script>
		/*----- Mobile Toggle Menu -----*/
		$('.close_btn, .overlay, .buuz_left_menu ul li a').on('click', function () {
		  $('.toggle_nav').removeClass('show');
		  $('.overlay').removeClass('active');
		  jQuery('body').removeClass('bodyactive');
		});
		$('.toggle_nav').on('click', function () {
		  $('.overlay').addClass('active');
		  jQuery('body').addClass('bodyactive');
		});

		/*----- Dashboard Mobile Menu ------*/
		function openNav() {
		  document.getElementById("mobile_adminnav").style.left = "0";
		}
		function closeNav() {
		  document.getElementById("mobile_adminnav").style.left = "-100%";
		}
	</script>
	
  </body>
</html>
	