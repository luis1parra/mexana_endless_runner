<?php defined('BASEPATH') or exit('No direct script access allowed');

class Facturas_model extends CI_Model
{
    protected $table = 'facturas';

    // Campos finales que necesita la vista
    private $select = '
        f.id_factura,
        f.numero_factura,
        f.lugar_compra,
        f.fecha_registro,
        f.foto_factura,
        f.estado,
        f.id_user_game,
        f.id_user_admin,
        e.id_estado_factura,
        e.valor AS estado_valor,
        ua.nombre AS admin_nombre,
        ua.apellido AS admin_apellido
    ';

    private function _base_query(array $filters = [])
    {
        $this->db->select($this->select, FALSE)
            ->from($this->table . ' f')
            ->join('estados_factura e', 'e.id_estado_factura = f.estado', 'left')
            ->join('users_admin ua', 'ua.id_user_admin = f.id_user_admin', 'left');

        // Filtros exactos/like seguros
        if (!empty($filters['lugar_compra'])) {
            $this->db->like('f.lugar_compra', $filters['lugar_compra']);
        }
        if (!empty($filters['numero_factura'])) {
            $this->db->like('f.numero_factura', $filters['numero_factura']);
        }
        if (!empty($filters['fecha_registro'])) {
            // Igualar por fecha (ignora hora)
            $this->db->where('DATE(f.fecha_registro) =', $filters['fecha_registro']);
        }
        if (isset($filters['estado']) && $filters['estado'] !== '' && $filters['estado'] !== null) {
            // estado es id_estado_factura
            $this->db->where('f.estado', (int)$filters['estado']);
        }
        if (!empty($filters['id_user_game'])) {
            $this->db->where('f.id_user_game', (int)$filters['id_user_game']);
        }
        if (!empty($filters['id_user_admin'])) {
            $this->db->where('f.id_user_admin', (int)$filters['id_user_admin']);
        }
    }

    public function list($limit = 10, $offset = 0, array $filters = [])
    {
        $this->_base_query($filters);
        $this->db->order_by('f.fecha_registro', 'DESC');
        $query = $this->db->limit($limit, $offset)->get();
        return $query->result();
    }

    public function count_all(array $filters = [])
    {
        $this->_base_query($filters);
        return $this->db->count_all_results();
    }

    public function get_by_id($id)
    {
        return $this->db->select('
            f.*,
            e.valor AS estado_valor,
            ua.nombre AS admin_nombre,
            ua.apellido AS admin_apellido
        ')
            ->from($this->table . ' f')
            ->join('estados_factura e', 'e.id_estado_factura = f.estado', 'left')
            ->join('users_admin ua', 'ua.id_user_admin = f.id_user_admin', 'left')
            ->where('f.id_factura', (int)$id)
            ->limit(1)
            ->get()->row();
    }

    public function update_estado($id_factura, $nuevo_estado_id, $id_user_admin)
    {
        return $this->db->where('id_factura', (int)$id_factura)->update($this->table, [
            'estado'        => (int)$nuevo_estado_id,
            'id_user_admin' => (int)$id_user_admin,   // quién lo revisó
            // si quieres, agrega un campo fecha_validacion en tu tabla y actualízalo aquí
            'fecha_validacion' => date('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Busca el id de estado por su valor (texto) de forma case-insensitive.
     * p.ej. get_estado_id_por_valor('validada') => 2
     */
    public function get_estado_id_por_valor($valor)
    {
        $row = $this->db->select('id_estado_factura')
            ->from('estados_factura')
            ->where('LOWER(valor)=', strtolower($valor))
            ->limit(1)->get()->row();
        return $row ? (int)$row->id_estado_factura : null;
    }
}
