<!-- Content Wrapper. Contains page content -->
<div class="content-wrapper">
    <!-- Content Header (Page header) -->
    <div class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6">
                    <h1 class="m-0 text-dark">Users</h1>
                </div><!-- /.col -->
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item">
                            <a href="<?php echo base_url('dashboard'); ?>">
                                <i class="fa fa-tachometer-alt"></i> Dashboard
                            </a>
                        </li>
                        <li class="breadcrumb-item active">Users</li>
                    </ol>
                </div><!-- /.col -->
            </div><!-- /.row -->
        </div><!-- /.container-fluid -->
    </div>
    <!-- /.content-header -->

    <!-- Main content -->
    <section class="content">
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-3">

                    <!-- Profile Image -->
                    <div class="card card-primary card-outline">
                        <div class="card-body box-profile">
                            <div class="text-center">
                                <img class="profile-user-img img-fluid img-circle"
                                     src="<?php echo INCLUDE_ASSETS; ?>img/user4-128x128.jpg"
                                     alt="User profile picture">
                            </div>

                            <h3 class="profile-username text-center">Nina Mcintire</h3>

                            <p class="text-muted text-center">Software Engineer</p>

                            <ul class="list-group list-group-unbordered mb-3">
                                <li class="list-group-item">
                                    <b>Status</b> <a class="float-right"><span class="badge bg-success">Active</span></a>
                                </li>
                                <li class="list-group-item">
                                    <b>Rating</b> <a class="float-right"><span class="badge bg-success">3.0</span></a>
                                </li>
                                <li class="list-group-item">
                                    <b>Orders</b> <a class="float-right"><span class="badge bg-success">300</span></a>
                                </li>
                            </ul>

                            <a href="#" class="btn btn-primary btn-block"><b>Orders</b></a>
                        </div>
                        <!-- /.card-body -->
                    </div>
                    <!-- /.card -->
                </div>
                <!-- /.col -->
                <div class="col-md-9">
                    <div class="card">
                        <div class="card-header p-2">
                            <ul class="nav nav-pills">
                                <li class="nav-item"><a class="nav-link active" href="#basicDetails" data-toggle="tab">Basic Details</a></li>
                                <li class="nav-item"><a class="nav-link" href="#accountDetails" data-toggle="tab">Account Details</a></li>
                            </ul>
                        </div><!-- /.card-header -->
                        <div class="card-body">
                            <div class="tab-content">
                                <!-- Basic Details -->
                                <div class="active tab-pane" id="basicDetails">
                                    <table class="table table-bordered table-striped">
                                        <tbody>
                                            <tr>
                                                <th>Name</th>
                                                <td>Alex</td>
                                            </tr>
                                            <tr>
                                                <th>Email</th>
                                                <td>Alex@mail.com</td>
                                            </tr>
                                            <tr>
                                                <th>Phone Number</th>
                                                <td>+91 - 9876543210</td>
                                            </tr>
                                            <tr>
                                                <th>Country</th>
                                                <td>India</td>
                                            </tr>
                                            <tr>
                                                <th>State</th>
                                                <td>Uttar Pradesh</td>
                                            </tr>
                                            <tr>
                                                <th>City</th>
                                                <td>Delhi</td>
                                            </tr>
                                            <tr>
                                                <th>Joined Date</th>
                                                <td>15 Jan, 2020</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <!-- Account Details -->
                                <div class="tab-pane" id="accountDetails">
                                    <table class="table table-bordered table-striped">
                                        <tbody>
                                            <tr>
                                                <th>Bank Name</th>
                                                <td>State Bank Of India</td>
                                            </tr>
                                            <tr>
                                                <th>Account Number</th>
                                                <td>511********786</td>
                                            </tr>
                                            <tr>
                                                <th>IFSC Code</th>
                                                <td>SBIN123</td>
                                            </tr>
                                            <tr>
                                                <th>Account Holder Name</th>
                                                <td>Alex</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <!-- /.tab-content -->
                        </div><!-- /.card-body -->
                    </div>
                    <!-- /.nav-tabs-custom -->
                </div>
                <!-- /.col -->
            </div>
            <!-- /.row -->
        </div><!-- /.container-fluid -->
    </section>
    <!-- /.content -->
</div>
<!-- /.content-wrapper -->