<!-- Main Footer -->
<footer class="main-footer">
    <strong>Copyright &copy; <?php echo date('Y'); ?> <a href="<?php echo base_url('dashboard'); ?>">TierZero</a>.</strong>
    All rights reserved.
</footer>
</div>
<!-- ./wrapper -->

<!-- REQUIRED SCRIPTS -->
<!-- jQuery -->
<script src="<?php echo INCLUDE_ASSETS; ?>plugins/jquery/jquery.min.js"></script>
<!-- Bootstrap -->
<script src="<?php echo INCLUDE_ASSETS; ?>plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
<!-- overlayScrollbars -->
<script src="<?php echo INCLUDE_ASSETS; ?>plugins/overlayScrollbars/js/jquery.overlayScrollbars.min.js"></script>
<!-- AdminLTE App -->
<script src="<?php echo INCLUDE_ASSETS; ?>js/adminlte.js"></script>
<!-- DataTables -->
<script src="<?php echo INCLUDE_ASSETS; ?>plugins/datatables/jquery.dataTables.js"></script>
<script src="<?php echo INCLUDE_ASSETS; ?>plugins/datatables-bs4/js/dataTables.bootstrap4.js"></script>

<!-- ChartJS -->
<script src="<?php echo INCLUDE_ASSETS; ?>plugins/chart.js/Chart.min.js"></script>
<!-- PAGE SCRIPTS -->
<script src="<?php echo INCLUDE_ASSETS; ?>js/dashboard.js"></script>
<script>
    $(function () {
        $('#user_lists').DataTable();
    });
</script>
</body>
</html>