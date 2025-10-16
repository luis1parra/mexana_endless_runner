<?php defined('BASEPATH') OR exit('No direct script access allowed');

class Users_admin_model extends CI_Model {
    protected $table = 'users_admin';

    public function get($id) {
        return $this->db->where('id_user_admin', (int)$id)->get($this->table)->row();
    }

    public function get_by_email($email) {
        return $this->db->where('email', $email)->limit(1)->get($this->table)->row();
    }

    public function email_exists($email, $ignoreId = null) {
        $this->db->where('email', $email);
        if ($ignoreId) $this->db->where('id_user_admin <>', (int)$ignoreId);
        return (bool) $this->db->limit(1)->get($this->table)->row();
    }

    public function list($limit=10, $offset=0, $q=null) {
        if ($q) {
            $this->db->group_start()
                     ->like('nombre', $q)
                     ->or_like('apellido', $q)
                     ->or_like('email', $q)
                     ->group_end();
        }
        return $this->db->order_by('creado_en','DESC')
                        ->limit($limit, $offset)
                        ->get($this->table)->result();
    }

    public function count_all($q=null) {
        if ($q) {
            $this->db->group_start()
                     ->like('nombre', $q)
                     ->or_like('apellido', $q)
                     ->or_like('email', $q)
                     ->group_end();
        }
        return $this->db->count_all_results($this->table);
    }

    public function create($data) {
        // Espera: nombre, apellido, rol, email, password (plana)
        $insert = [
            'nombre'   => $data['nombre'],
            'apellido' => $data['apellido'],
            'rol'      => $data['rol'],
            'email'    => $data['email'],
            'password' => password_hash($data['password'], PASSWORD_BCRYPT, ['cost'=>12]),
            'creado_en'=> date('Y-m-d H:i:s'),
        ];
        return $this->db->insert($this->table, $insert);
    }

    public function update_user($id, $data) {
        $upd = [
            'nombre'   => $data['nombre'],
            'apellido' => $data['apellido'],
            'rol'      => $data['rol'],
            'email'    => $data['email'],
        ];
        if (!empty($data['password'])) {
            $upd['password'] = password_hash($data['password'], PASSWORD_BCRYPT, ['cost'=>12]);
        }
        return $this->db->where('id_user_admin', (int)$id)->update($this->table, $upd);
    }

    /* public function create($data) {
        $data['creado_en'] = date('Y-m-d H:i:s');
        return $this->db->insert($this->table, $data);
    } */
}
