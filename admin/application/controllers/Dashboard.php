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

        $page   = max(1, (int) $this->input->get('page'));
        $limit  = 10;
        $offset = ($page - 1) * $limit;

        $total_rows = $this->facturas->count_all($filters);
        $rows       = $this->facturas->list($limit, $offset, $filters);

        $config['total_rows'] = $total_rows;
        $config['per_page']   = $limit;
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
