<?php defined('BASEPATH') OR exit('No direct script access allowed');

class Users_admin_model extends CI_Model {
    protected $table = 'users_admin';

    public function get_by_email($email) {
        return $this->db
            ->where('email', $email)
            ->limit(1)
            ->get($this->table)
            ->row();
    }

    public function create($data) {
        $data['creado_en'] = date('Y-m-d H:i:s');
        return $this->db->insert($this->table, $data);
    }
}
