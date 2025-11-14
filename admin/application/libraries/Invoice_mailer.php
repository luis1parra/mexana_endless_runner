<?php defined('BASEPATH') OR exit('No direct script access allowed');

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

class Invoice_mailer
{
    /**
     * @var CI_Controller
     */
    protected $ci;

    public function __construct()
    {
        $this->ci = &get_instance();
        $this->bootstrap_dependencies();
    }

    /**
     * Loads PHPMailer dependencies only once.
     */
    protected function bootstrap_dependencies(): void
    {
        if (!class_exists(PHPMailer::class)) {
            require_once APPPATH . '../apigame/PHPMailer/src/Exception.php';
            require_once APPPATH . '../apigame/PHPMailer/src/PHPMailer.php';
            require_once APPPATH . '../apigame/PHPMailer/src/SMTP.php';
        }
    }

    /**
     * Sends a rejection notice to the given email address.
     *
     * @param string $email
     * @param array{numero_factura?:string,lugar_compra?:string,nombre?:string} $context
     * @return bool
     */
    public function send_rejection_notice(string $email, array $context = []): bool
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            log_message('error', 'Invoice_mailer: invalid email supplied: ' . $email);
            return false;
        }

        $assets  = $this->prepare_assets();
        $subject = 'Actualización sobre tu factura Mexsana';
        $body    = $this->build_html_body($context, $assets);

        $mailer = new PHPMailer(true);

        try {
            $mailer->isSMTP();
            $mailer->CharSet   = 'UTF-8';
            $mailer->Host      = 'smtp.gmail.com';
            $mailer->Port      = 587;
            $mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mailer->SMTPAuth  = true;
            $mailer->Username  = 'lparra@pressstart.co';
            $mailer->Password  = 'deog gfpv ksbg rnxr';

            $mailer->setFrom('lparra@pressstart.co', 'Luis Parra');
            $mailer->addAddress($email);

            foreach ($assets as $asset) {
                $mailer->addEmbeddedImage(
                    $asset['path'],
                    $asset['cid'],
                    $asset['filename'],
                    'base64',
                    $asset['mime']
                );
            }

            $mailer->isHTML(true);
            $mailer->Subject = $subject;
            $mailer->Body    = $body;
            $mailer->AltBody = $this->build_alt_body($context);

            $mailer->send();
            return true;
        } catch (Exception $exception) {
            log_message('error', 'Invoice_mailer: could not send mail. ' . $exception->getMessage());
            return false;
        }
    }

    /**
     * Builds a simple HTML body using the provided context.
     *
     * @param array{numero_factura?:string,lugar_compra?:string,nombre?:string} $context
     */
    /**
     * @param array<string,array{path:string,cid:string,filename:string,mime:string}> $assets
     */
    protected function build_html_body(array $context, array $assets): string
    {
        $baseUrl = rtrim((string) $this->ci->config->item('base_url'), '/');
        if ($baseUrl === '') {
            $baseUrl = 'https://www.pressstartevolution.com/tbwa/mexana/admin';
        }
        $publicUrl = preg_replace('#/admin$#', '', $baseUrl);

        $data = [
            'name'              => $context['nombre'] ?? null,
            'cta_url'           => $context['cta_url'] ?? ($publicUrl . '/game-runner/'),
            'cta_text'          => $context['cta_text'] ?? 'Ingresar factura',
            'header_src'        => isset($assets['header']) ? 'cid:' . $assets['header']['cid'] : '',
            'tittle_src'        => isset($assets['tittle']) ? 'cid:' . $assets['tittle']['cid'] : '',
            'body_src'          => isset($assets['body']) ? 'cid:' . $assets['body']['cid'] : '',
            'footer_mexana_src' => isset($assets['footer_mexana']) ? 'cid:' . $assets['footer_mexana']['cid'] : '',
            'footer_connect_src'=> isset($assets['footer_connect']) ? 'cid:' . $assets['footer_connect']['cid'] : '',
            'footer_fb_src'     => isset($assets['footer_facebook']) ? 'cid:' . $assets['footer_facebook']['cid'] : '',
            'footer_ig_src'     => isset($assets['footer_instagram']) ? 'cid:' . $assets['footer_instagram']['cid'] : '',
            'invoice_number'    => $context['numero_factura'] ?? null,
            'purchase_place'    => $context['lugar_compra'] ?? null,
        ];

        return $this->ci->load->view('emails/factura_rechazada', $data, true);
    }

    protected function build_alt_body(array $context): string
    {
        $nombre        = trim($context['nombre'] ?? '');
        $numeroFactura = trim($context['numero_factura'] ?? '');
        $lugarCompra   = trim($context['lugar_compra'] ?? '');

        $detalleLine = null;
        if ($numeroFactura !== '' || $lugarCompra !== '') {
            $parts = [];
            if ($numeroFactura !== '') {
                $parts[] = 'Factura: ' . $numeroFactura;
            }
            if ($lugarCompra !== '') {
                $parts[] = 'Lugar: ' . $lugarCompra;
            }
            $detalleLine = implode(' · ', $parts);
        }

        return implode("\n\n", array_filter([
            $nombre !== '' ? "Hola {$nombre}," : 'Hola,',
            'Te informamos que la factura no pudo ser validada.',
            $detalleLine,
            'Por favor revisa que el archivo sea legible (JPG, PNG o PDF) y vuelva a subirlo para continuar participando.',
            'Si necesitas ayuda, responde a este correo.',
        ]));
    }

    /**
     * @return array<string,array{path:string,cid:string,filename:string,mime:string}>
     */
    protected function prepare_assets(): array
    {
        $files = [
            'header'            => ['email_header.png', 'image/png'],
            'tittle'            => ['email_tittle.png', 'image/png'],
            'body'              => ['email_body.png', 'image/png'],
            'footer_mexana'     => ['footer_mexana.png', 'image/png'],
            'footer_connect'    => ['footer_conectate.png', 'image/png'],
            'footer_facebook'   => ['footer_facebook.png', 'image/png'],
            'footer_instagram'  => ['footer_instagram.png', 'image/png'],
        ];

        $assets = [];
        foreach ($files as $key => $info) {
            [$filename, $mime] = $info;
            $path = APPPATH . 'views/emails/assets/' . $filename;
            if (!is_file($path)) {
                log_message('error', 'Invoice_mailer: asset not found ' . $path);
                continue;
            }

            $assets[$key] = [
                'path'     => $path,
                'cid'      => 'cid_' . $key . '_' . uniqid(),
                'filename' => $filename,
                'mime'     => $mime,
            ];
        }

        return $assets;
    }
}
