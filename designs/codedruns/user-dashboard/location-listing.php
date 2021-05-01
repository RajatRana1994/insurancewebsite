<?php require_once 'header-user-dashboard.php'; ?>
		<div class="main_content dashboard_content">
			<div class="row">
				<div class="col-md-12">
					<div class="dashboard_heading">
						<div class="dashboard_title user_single_anchor">
							<h2>Locations Listing</h2>
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
							<th class="left_align">Country</th>
							<th class="left_align">State</th>
							<th class="left_align">City</th>
							<th>Added On</th>
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
							<td class="left_align">Kiribati  </td>
							<td class="left_align">Lake Pauline</td>
							<td class="left_align">Wintheiserville</td>
							<td>04 May 2020</td>
							<td>
								<button type="button" class="btn pink_outline edit_btn">Edit</button>
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
							<td class="left_align">Holy See (Vatican City State)  </td>
							<td class="left_align">Lake Geovany</td>
							<td class="left_align">New Judge</td>
							<td>04 Feb 2020</td>
							<td>
								<button type="button" class="btn pink_outline edit_btn">Edit</button>
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
							<td class="left_align">Kiribati  </td>
							<td class="left_align">Lake Pauline</td>
							<td class="left_align">Wintheiserville</td>
							<td>04 May 2020</td>
							<td>
								<button type="button" class="btn pink_outline edit_btn">Edit</button>
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