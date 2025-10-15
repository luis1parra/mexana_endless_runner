<?php defined('BASEPATH') OR exit('No direct script access allowed');

class Auth extends CI_Controller {

    private $max_attempts = 5;
    private $block_minutes = 15;

    public function __construct() {
        parent::__construct();
        $this->load->model('Users_admin_model', 'users');
        $this->load->library(['form_validation']);
        $this->load->helper(['url','form','security']);
    }

    public function login() {
        if ($this->session->userdata('user')) return redirect('dashboard');

        if ($this->input->method(TRUE) === 'POST') {
            $blocked_until = $this->session->userdata('login_block_until');
            if ($blocked_until && time() < $blocked_until) {
                $mins = ceil(($blocked_until - time())/60);
                $this->session->set_flashdata('error', "Demasiados intentos. Intenta en ~{$mins} min.");
                return redirect('login');
            }

            $this->form_validation->set_rules('email', 'Email', 'trim|required|valid_email|max_length[255]');
            $this->form_validation->set_rules('password', 'Contraseña', 'trim|required|min_length[8]|max_length[100]');

            if ($this->form_validation->run() === FALSE) {
                $this->session->set_flashdata('error', validation_errors(' ', ' '));
                return redirect('login');
            }

            $email = $this->input->post('email', TRUE);
            $pass  = $this->input->post('password', TRUE);

            $user = $this->users->get_by_email($email);

            if (!$user || !password_verify($pass, $user->password)) {
                $attempts = (int)$this->session->userdata('login_attempts');
                $attempts++;
                $this->session->set_userdata('login_attempts', $attempts);
                if ($attempts >= $this->max_attempts) {
                    $this->session->set_userdata('login_block_until', time() + ($this->block_minutes * 60));
                    $this->session->set_userdata('login_attempts', 0);
                }
                $this->session->set_flashdata('error', 'Credenciales inválidas.');
                return redirect('login');
            }

            $this->session->unset_userdata(['login_attempts','login_block_until']);
            $this->session->sess_regenerate(TRUE);

            $this->session->set_userdata('user', [
                'id'       => (int)$user->id_user_admin,
                'nombre'   => $user->nombre,
                'apellido' => $user->apellido,
                'rol'      => $user->rol,
                'email'    => $user->email,
            ]);

            return redirect('dashboard');
        }

        $this->load->view('auth/login');
    }

    public function logout() {
        $this->session->sess_regenerate(TRUE);
        $this->session->unset_userdata('user');
        $this->session->sess_destroy();
        redirect('login');
    }
}
