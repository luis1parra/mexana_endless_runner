<?php defined('BASEPATH') OR exit('No direct script access allowed');

class Usuarios extends Authenticated_Controller {

    public function __construct() {
        parent::__construct();
        $this->load->model('Users_admin_model', 'users');
        $this->load->library(['form_validation','pagination']);
        $this->load->helper(['url','form','security']);
        // Solo superadmin puede gestionar usuarios
        $u = $this->session->userdata('user');
        if (!$u || $u['rol'] !== 'superadmin') {
            $this->session->set_flashdata('error','No autorizado.');
            redirect('dashboard');
        }
    }

    public function index() {
        $q = $this->input->get('q', TRUE);
        $page   = max(1, (int)$this->input->get('page'));
        $limit  = 10;
        $offset = ($page - 1) * $limit;

        $total = $this->users->count_all($q);
        $rows  = $this->users->list($limit, $offset, $q);

        $config = [
            'base_url'             => site_url('usuarios'),
            'page_query_string'    => TRUE,
            'query_string_segment' => 'page',
            'reuse_query_string'   => TRUE,
            'total_rows'           => $total,
            'per_page'             => $limit,
        ];
        $this->pagination->initialize($config);

        $this->load->view('usuarios/index', [
            'title'      => 'Usuarios',
            'rows'       => $rows,
            'q'          => $q,
            'total'      => $total,
            'page'       => $page,
            'per_page'   => $limit,
            'pagination' => $this->pagination->create_links(),
        ]);
    }

    public function form($id = null) {
        $is_edit = !empty($id);
        $userRow = $is_edit ? $this->users->get($id) : null;
        if ($is_edit && !$userRow) {
            $this->session->set_flashdata('error', 'Usuario no encontrado.');
            return redirect('usuarios');
        }

        if ($this->input->method(TRUE) === 'POST') {
            // reglas
            $this->form_validation->set_rules('nombre', 'Nombre', 'trim|required|max_length[100]');
            $this->form_validation->set_rules('apellido', 'Apellido', 'trim|required|max_length[100]');
            $this->form_validation->set_rules('rol', 'Rol', 'trim|required|in_list[superadmin,validador]');
            $this->form_validation->set_rules('email', 'Email', 'trim|required|valid_email|max_length[255]');

            if ($is_edit) {
                // password opcional
                if ($this->input->post('password')) {
                    $this->form_validation->set_rules('password', 'Contraseña', 'trim|min_length[8]|max_length[100]');
                    $this->form_validation->set_rules('password_confirm', 'Confirmación', 'trim|matches[password]');
                }
            } else {
                $this->form_validation->set_rules('password', 'Contraseña', 'trim|required|min_length[8]|max_length[100]');
                $this->form_validation->set_rules('password_confirm', 'Confirmación', 'trim|required|matches[password]');
            }

            if ($this->form_validation->run() === FALSE) {
                $this->session->set_flashdata('error', validation_errors(' ', ' '));
                return redirect(current_url());
            }

            // email único
            $email = $this->input->post('email', TRUE);
            if ($this->users->email_exists($email, $is_edit ? (int)$id : null)) {
                $this->session->set_flashdata('error', 'El email ya está registrado.');
                return redirect(current_url());
            }

            $payload = [
                'nombre'   => $this->input->post('nombre', TRUE),
                'apellido' => $this->input->post('apellido', TRUE),
                'rol'      => $this->input->post('rol', TRUE),
                'email'    => $email,
                'password' => $this->input->post('password', TRUE), // puede venir vacío en edición
            ];

            if ($is_edit) {
                $ok = $this->users->update_user((int)$id, $payload);
                $msg = $ok ? 'Usuario actualizado' : 'No se pudo actualizar';
            } else {
                $ok = $this->users->create($payload);
                $msg = $ok ? 'Usuario creado' : 'No se pudo crear';
            }

            $this->session->set_flashdata($ok ? 'success' : 'error', $msg);
            return redirect('usuarios');
        }

        // GET: mostrar formulario
        $this->load->view('usuarios/form', [
            'title'   => $is_edit ? 'Editar usuario' : 'Crear usuario',
            'is_edit' => $is_edit,
            'row'     => $userRow,
        ]);
    }
}
