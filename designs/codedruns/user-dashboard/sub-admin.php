<?php require_once 'header-user-dashboard.php'; ?>
		<div class="main_content dashboard_content">
			<div class="row">
				<div class="col-md-12">
					<div class="dashboard_heading">
						<div class="dashboard_title user_single_anchor">
							<h2>Sub Admins</h2>
						</div>
						<div class="dashboard_title_btn user_dashboard_title_btn">
							<a href="product-add.php" type="button" class="btn add_new_btn">Add New</a>
							<a class="export_icon" href="#"><img src="../assets/images/ic_export.svg" alt=""></a>
						</div>
					</div>
				</div>
			</div>
			
			<div class="table-responsive table_common">
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
							<th class="left_align">Full Name</th>
							<th class="left_align">Email</th>
							<th class="left_align">Phone Number</th>
							<th>Setup On</th>
							<th>Last Login</th>
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
							<td class="left_align">Jay Baldwin  </td>
							<td class="left_align">tromp_lorne@yahoo.com</td>
							<td class="left_align">523-208-8741</td>
							<td>29 Dec 2020</td>
							<td>14 Nov 2020</td>
							<td>
								<button type="button" class="btn pink_outline edit_btn mr-2">Edit</button>
								<button type="button" class="btn pink_outline">Remove</button>
							</td>
						</tr>
						<tr>
							<td>
								<div class="custom_radio mt-0">
									<input type="checkbox" id="product2" name="availability">
									<label for="product2"></label>
								</div>
							</td>
							<td>02</td>
							<td class="left_align">Jason Ross  </td>
							<td class="left_align">darin_lorne@yahoo.com</td>
							<td class="left_align">154-104-7489</td>
							<td>18 Dec 2020</td>
							<td>20 Nov 2020</td>
							<td>
								<button type="button" class="btn pink_outline edit_btn mr-2">Edit</button>
								<button type="button" class="btn pink_outline">Remove</button>
							</td>
						</tr>
						<tr>
							<td>
								<div class="custom_radio mt-0">
									<input type="checkbox" id="product2" name="availability">
									<label for="product2"></label>
								</div>
							</td>
							<td>03</td>
							<td class="left_align">Jay Baldwin  </td>
							<td class="left_align">tromp.lorne@yahoo.com</td>
							<td class="left_align">523-208-8741</td>
							<td>29 Dec 2020</td>
							<td>14 Nov 2020</td>
							<td>
								<button type="button" class="btn pink_outline edit_btn mr-2">Edit</button>
								<button type="button" class="btn pink_outline">Remove</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
<?php require_once 'footer.php'; ?>