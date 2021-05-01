<?php require_once 'header-user-dashboard.php'; ?>
		<div class="main_content dashboard_content">
			<div class="row">
				<div class="col-md-12">
					<div class="dashboard_heading">
						<div class="dashboard_title">
							<a class="active" href="#">Escorts</a>
							<a href="#">Vendors</a>
							<a href="#">Clients</a>
						</div>
						<div class="dashboard_title_btn">
							<a class="export_icon" href="#"><img src="../assets/images/ic_export.svg" alt=""></a>
						</div>
					</div>
				</div>
			</div>
			
			<div class="row">
				<div class="col-md-12 d-flex justify-content-between">
					<ul class="button_tab_outer">
						<li><a class="btn tab_btn active" href="user-list.php">Active</a></li>
						<li><a class="btn tab_btn" href="pending-user-list.php">Pending</a></li>
						<li><a class="btn tab_btn" href="">Blocked</a></li>
					</ul>
					<div class="user_search">
						<span class="fa fa-search user_seacrh_icon"></span>
						<input type="text" class="form-control" placeholder="Search by escorts name...">
					</div>
				</div>
			</div>
			
			<div class="table-responsive table_common user-dashboard-table">
				<table class="table table-striped">
					<thead>
						<tr>
							<th>
								<div class="custom_radio mt-0">
									<input type="checkbox" id="product1" name="availability">
									<label for="product1"></label>
								</div>
							</th>
							<th>#</th>
							<th>Image</th>
							<th class="left_align">Name</th>
							<th>Contact</th>
							<th>Age</th>
							<th>Clients</th>
							<th>Earnings</th>
							<th>Reviews</th>
							<th>Joining Date</th>
							<th width="185">Action</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								<div class="custom_radio mt-0">
									<input type="checkbox" id="product2" name="availability">
									<label for="product2"></label>
								</div>
							</td>
							<td>01</td>
							<td><img src="../assets/images/img2.jpg" alt="" width="50"></td>
							<td class="left_align"><a href="user-detail.php">MelaninGoddess</a></td>
							<td>09876543210</td>
							<td>24</td>
							<td>102</td>
							<td>$240</td>
							<td><a class="color_yellow" href="review-list.php">56</a></td>
							<td>22 Jun 2020</td>
							<td>
								<button type="button" class="btn pink_outline">Block User</button>
							</td>
						</tr>
						<tr>
							<td>
								<div class="custom_radio mt-0">
									<input type="checkbox" id="product3" name="availability">
									<label for="product3"></label>
								</div>
							</td>
							<td>02</td>
							<td><img src="../assets/images/img2.jpg" alt="" width="50"></td>
							<td class="left_align"><a href="user-detail.php">MelaninGoddess</a></td>
							<td>09876543210</td>
							<td>22</td>
							<td>28</td>
							<td>$541</td>
							<td><a class="color_yellow" href="review-list.php">99</a></td>
							<td>30 May 2020</td>
							<td>
								<button type="button" class="btn pink_outline">Block User</button>
							</td>
						</tr>
						<tr>
							<td>
								<div class="custom_radio mt-0">
									<input type="checkbox" id="product3" name="availability">
									<label for="product3"></label>
								</div>
							</td>
							<td>03</td>
							<td><img src="../assets/images/img2.jpg" alt="" width="50"></td>
							<td class="left_align"><a href="user-detail.php">MelaninGoddess</a></td>
							<td>09876543210</td>
							<td>25</td>
							<td>55</td>
							<td>$150</td>
							<td><a class="color_yellow"  href="review-list.php">24</a></td>
							<td>02 Feb 2020</td>
							<td>
								<button type="button" class="btn pink_outline">Block User</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
<?php require_once 'footer.php'; ?>