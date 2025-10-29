<?php defined('BASEPATH') OR exit('No direct script access allowed');

class Dashboard extends Authenticated_Controller {

    public function index() {
        $this->load->model('Facturas_model', 'facturas');
        $this->load->library('pagination');

        $user = $this->session->userdata('user');

        // Filtros desde GET (XSS clean)
        $filters = [
            'lugar_compra'   => $this->input->get('lugar_compra', TRUE),
            'numero_factura' => $this->input->get('numero_factura', TRUE),
            'fecha_registro' => $this->input->get('fecha_registro', TRUE), // formato YYYY-MM-DD
            'estado'         => $this->input->get('estado', TRUE),
            'id_user_game'   => $this->input->get('id_user_game', TRUE),
            'id_user_admin'  => $this->input->get('id_user_admin', TRUE),
            'email'          => $this->input->get('email', TRUE),
        ];

        // Por defecto, estado == 1 (si no viene nada)
        if ($filters['estado'] === NULL || $filters['estado'] === '') {
            $filters['estado'] = 1;
        }

        // Paginación básica
        $config['base_url']             = site_url('dashboard');
        $config['page_query_string']    = TRUE;
        $config['query_string_segment'] = 'page';
        $config['reuse_query_string']   = TRUE;
        $config['use_page_numbers']     = TRUE;

        $page   = max(1, (int) $this->input->get('page'));
        $allowedPageSizes = [5, 10, 20, 50, 100];
        $limitParam = (int) $this->input->get('per_page');
        $limit  = in_array($limitParam, $allowedPageSizes, true) ? $limitParam : 10;
        $offset = ($page - 1) * $limit;

        $total_rows = $this->facturas->count_all($filters);
        $rows       = $this->facturas->list($limit, $offset, $filters);

        $config['total_rows']       = $total_rows;
        $config['per_page']         = $limit;
        // Estilos de paginación: más separación entre enlaces
        $config['full_tag_open']    = '<nav class="mt-2"><ul class="inline-flex items-center gap-2">';
        $config['full_tag_close']   = '</ul></nav>';
        $config['num_tag_open']     = '<li>';
        $config['num_tag_close']    = '</li>';
        $config['prev_tag_open']    = '<li>';
        $config['prev_tag_close']   = '</li>';
        $config['next_tag_open']    = '<li>';
        $config['next_tag_close']   = '</li>';
        $config['first_tag_open']   = '<li>';
        $config['first_tag_close']  = '</li>';
        $config['last_tag_open']    = '<li>';
        $config['last_tag_close']   = '</li>';
        $config['cur_tag_open']     = '<li><span class="px-3 py-1 rounded-lg bg-mxs-brand text-black font-semibold">';
        $config['cur_tag_close']    = '</span></li>';
        // Clase para los enlaces <a>
        $config['attributes']       = ['class' => 'px-3 py-1 rounded-lg bg-white/10 hover:bg-white/5'];
        $this->pagination->initialize($config);

        // Cargar catálogo de estados para el <select>
        $estados = $this->db->select('id_estado_factura, valor')
                            ->order_by('valor', 'ASC')
                            ->get('estados_factura')
                            ->result();

        // Cargar lista de revisores (opcional para filtro id_user_admin)
        $admins  = $this->db->select('id_user_admin, nombre, apellido')
                            ->order_by('nombre', 'ASC')
                            ->get('users_admin')
                            ->result();

        $this->load->view('dashboard/index', [
            'title'      => 'Facturas',
            'user'       => $user,
            'facturas'   => $rows,
            'filters'    => $filters,
            'estados'    => $estados,
            'admins'     => $admins,
            'pagination' => $this->pagination->create_links(),
            'total'      => $total_rows,
            'page'       => $page,
            'per_page'   => $limit,
        ]);
    }
}
