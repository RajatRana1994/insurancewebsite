<?php require_once 'header-user-dashboard.php'; ?>
		<div class="main_content dashboard_content">
			<div class="row">
				<div class="col-md-12">
					<div class="dashboard_heading">
						<div class="dashboard_title">
							<div class="dashboard_title user_single_anchor">
								<a class="active" href="setting.php"><i class="fa fa-angle-left" aria-hidden="true"></i> Service Management</a>
							</div>
						</div>
						<div class="dashboard_title_btn user_dashboard_title_btn">
							<a href="product-add.php" type="button" class="btn add_new_btn">Add New</a>
						</div>
					</div>
				</div>
			</div>
			
			<div class="table-responsive table_common">
				<table class="table table-striped">
					<thead>
						<tr>
							<th width="90">
								<div class="custom_radio mt-0">
									<input type="checkbox" id="product1" name="availability">
									<label for="product1"></label>
								</div>
							</th>
							<th width="80">#</th>
							<th class="left_align">Service Name</th>
							<th>Status</th>
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
							<td class="left_align">69 (69 sex position)</td>
							<td>
								<label class="switch_custom">
								  <input type="checkbox" checked="">
								  <span class="slider round"></span>
								</label>
							</td>
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
							<td class="left_align">A-Level (ANal sex)  </td>
							<td>
								<label class="switch_custom">
								  <input type="checkbox" checked="">
								  <span class="slider round"></span>
								</label>
							</td>
							<td>
								<button type="button" class="btn pink_outline edit_btn">Edit</button>
								<button type="button" class="btn pink_outline">Remove</button>
							</td>
						</tr><tr>
							<td>
								<div class="custom_radio mt-0">
									<input type="checkbox" id="product2" name="availability">
									<label for="product2"></label>
								</div>
							</td>
							<td>03</td>
							<td class="left_align">69 (69 sex position)</td>
							<td>
								<label class="switch_custom">
								  <input type="checkbox" checked="">
								  <span class="slider round"></span>
								</label>
							</td>
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