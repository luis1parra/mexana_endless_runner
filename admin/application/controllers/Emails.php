<?php defined('BASEPATH') OR exit('No direct script access allowed');

class Emails extends CI_Controller
{
    /**
     * Previsualizacion local del correo de factura rechazada.
     */
    public function factura_rechazada_preview()
    {
        if (defined('ENVIRONMENT') && ENVIRONMENT === 'production') {
            show_404();
        }

        $assetsBase = rtrim(site_url('emails/assets'), '/') . '/';

        $this->load->view('emails/factura_rechazada', [
            'name'              => 'Jugador Demo',
            'cta_url'           => site_url('dashboard'),
            'cta_text'          => 'Ingresar factura',
            'invoice_number'    => 'MX-000123',
            'purchase_place'    => 'Farmacia Demo',
            'header_src'        => $assetsBase . 'email_header.png',
            'tittle_src'        => $assetsBase . 'email_tittle.png',
            'body_src'          => $assetsBase . 'email_body.png',
            'footer_mexana_src' => $assetsBase . 'footer_mexana.png',
            'footer_connect_src'=> $assetsBase . 'footer_conectate.png',
            'footer_fb_src'     => $assetsBase . 'footer_facebook.png',
            'footer_ig_src'     => $assetsBase . 'footer_instagram.png',
        ]);
    }

    /**
     * Sirve los assets de la vista de email directamente desde application/.
     */
    public function asset($relativePath = '')
    {
        if (defined('ENVIRONMENT') && ENVIRONMENT === 'production') {
            show_404();
        }

        $segments = func_get_args();
        if (count($segments) > 1) {
            $relativePath = implode('/', $segments);
        } elseif (isset($segments[0])) {
            $relativePath = $segments[0];
        }

        $relativePath = trim((string) $relativePath, "/\\ \t\n\r\0\x0B");
        if ($relativePath === '' || strpos($relativePath, '..') !== false) {
            show_404();
        }

        $fullPath = APPPATH . 'views/emails/assets/' . str_replace(['\\', '//'], '/', $relativePath);

        if (!is_file($fullPath)) {
            show_404();
        }

        $ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
        $mimeMap = [
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg'=> 'image/jpeg',
            'svg' => 'image/svg+xml',
            'gif' => 'image/gif',
            'ttf' => 'font/ttf',
            'otf' => 'font/otf',
            'woff'=> 'font/woff',
            'woff2'=>'font/woff2',
        ];
        $mime = $mimeMap[$ext] ?? (function_exists('mime_content_type') ? mime_content_type($fullPath) : 'application/octet-stream');

        $this->output
            ->set_header('Content-Type: ' . $mime)
            ->set_header('Content-Length: ' . filesize($fullPath))
            ->set_output(file_get_contents($fullPath));
    }
}
