<?php defined('BASEPATH') OR exit('No direct script access allowed');

class Dashboard extends Authenticated_Controller {
    public function index() {
        $user = $this->session->userdata('user');
        $this->load->view('dashboard/index', ['user' => $user]);
    }
}
