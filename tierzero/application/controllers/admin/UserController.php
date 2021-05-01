<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class UserController extends CI_Controller {

    public function index() {
        $this->load->view('admin/header');
        $this->load->view('admin/sidebar');
        $this->load->view('admin/users/lists');
        $this->load->view('admin/footer');
    }
    
    public function userDetails() {
        $this->load->view('admin/header');
        $this->load->view('admin/sidebar');
        $this->load->view('admin/users/details');
        $this->load->view('admin/footer');
    }

}
