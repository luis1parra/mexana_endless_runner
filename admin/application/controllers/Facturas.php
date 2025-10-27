<?php defined('BASEPATH') OR exit('No direct script access allowed');

class Facturas extends Authenticated_Controller {

    public function __construct()
    {
        parent::__construct();
        $this->load->model('Facturas_model', 'facturas');
        $this->load->helper(['url','form','security']);
        $this->load->library(['form_validation', 'invoice_mailer']);
        // Solo superadmin o validador
        $u = $this->session->userdata('user');
        if (!$u || !in_array($u['rol'], ['superadmin','validador'])) {
            $this->session->set_flashdata('error', 'No autorizado.');
            redirect('dashboard');
        }
    }

    public function validar($id_factura)
    {
        $user = $this->session->userdata('user');
        $row  = $this->facturas->get_by_id($id_factura);
        if (!$row) {
            $this->session->set_flashdata('error', 'Factura no encontrada.');
            return redirect('dashboard');
        }

        // POST: procesar acción
        if ($this->input->method(TRUE) === 'POST') {
            // Dos botones submit: name="accion" value="validar"|"rechazar"
            $accion = $this->input->post('accion', TRUE);
            // Intenta mapear por texto de estado en tabla estados_factura
            if ($accion === 'validar') {
                $estado_id = $this->facturas->get_estado_id_por_valor('aprobada');
                // fallback opcional si no hay coincidencia por texto:
                if (!$estado_id) $estado_id = 2; // ajusta a tu catálogo real
            } elseif ($accion === 'rechazar') {
                $estado_id = $this->facturas->get_estado_id_por_valor('rechazada');
                if (!$estado_id) $estado_id = 3; // ajusta a tu catálogo real
            } else {
                $this->session->set_flashdata('error', 'Acción inválida.');
                return redirect(current_url());
            }

            $ok = $this->facturas->update_estado($id_factura, $estado_id, (int)$user['id']);
            $this->session->set_flashdata($ok ? 'success' : 'error',
                $ok ? 'Estado actualizado correctamente.' : 'No se pudo actualizar el estado.');

            if ($ok && $accion === 'rechazar' && !empty($row->user_correo)) {
                $nombre = trim(($row->user_nombre ?? '') . ' ' . ($row->user_apellido ?? ''));
                $mailSent = $this->invoice_mailer->send_rejection_notice($row->user_correo, [
                    'numero_factura' => $row->numero_factura,
                    'lugar_compra'   => $row->lugar_compra,
                    'nombre'         => $nombre !== '' ? $nombre : null,
                ]);

                if (!$mailSent) {
                    log_message('error', sprintf(
                        'Facturas: no se pudo enviar correo de rechazo para la factura %s (%d)',
                        $row->numero_factura,
                        $id_factura
                    ));
                }
            }

            // Tras validar/rechazar, vuelve al dashboard con filtros (opcional conserva estado)
            return redirect('dashboard?estado='.$estado_id);
        }

        // GET: mostrar vista
        // Carga todos los estados (por si quieres mostrarlos como info)
        $estados = $this->db->select('id_estado_factura, valor')->order_by('valor','ASC')->get('estados_factura')->result();

        $this->load->view('facturas/validar', [
            'title'   => 'Validar factura #'.$row->id_factura,
            'user'    => $user,
            'row'     => $row,
            'estados' => $estados,
        ]);
    }
}
