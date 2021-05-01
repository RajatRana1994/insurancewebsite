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
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Users</h3>
                        </div>
                        <!-- /.card-header -->
                        <div class="card-body">
                            <table id="user_lists" class="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone Number</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Alex</td>
                                        <td>alex@mail.com</td>
                                        <td>+91 - 9876543210</td>
                                        <td><span class="badge bg-success">Active</span></td>
                                        <td>
                                            <a title="View Details" href="<?php echo base_url('user/details'); ?>" class="btn btn-info btn-sm">
                                                <i class="fas fa-info-circle">
                                                </i>
                                                View
                                            </a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Sunny</td>
                                        <td>sunny@mail.com</td>
                                        <td>+91 - 9854321076</td>
                                        <td><span class="badge bg-danger">Inactive</span></td>
                                        <td>
                                            <a title="View Details" href="<?php echo base_url('user/details'); ?>" class="btn btn-info btn-sm">
                                                <i class="fas fa-info-circle">
                                                </i>
                                                View
                                            </a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Albert</td>
                                        <td>albert@mail.com</td>
                                        <td>+1 - 9867542310</td>
                                        <td><span class="badge bg-danger">Inactive</span></td>
                                        <td>
                                            <a title="View Details" href="<?php echo base_url('user/details'); ?>" class="btn btn-info btn-sm">
                                                <i class="fas fa-info-circle">
                                                </i>
                                                View
                                            </a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Ella</td>
                                        <td>ella@mail.com</td>
                                        <td>+91 - 9876543210</td>
                                        <td><span class="badge bg-success">Active</span></td>
                                        <td>
                                            <a title="View Details" href="<?php echo base_url('user/details'); ?>" class="btn btn-info btn-sm">
                                                <i class="fas fa-info-circle">
                                                </i>
                                                View
                                            </a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Anna</td>
                                        <td>anna@mail.com</td>
                                        <td>+91 - 9876543210</td>
                                        <td><span class="badge bg-success">Active</span></td>
                                        <td>
                                            <a title="View Details" href="<?php echo base_url('user/details'); ?>" class="btn btn-info btn-sm">
                                                <i class="fas fa-info-circle">
                                                </i>
                                                View
                                            </a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <!-- /.card-body -->
                    </div>
                </div>
            </div>
            <!-- /.row -->

        </div><!--/. container-fluid -->
    </section>
    <!-- /.content -->
</div>
<!-- /.content-wrapper -->