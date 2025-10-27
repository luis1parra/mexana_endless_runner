<?php
defined('BASEPATH') or exit('No direct script access allowed');

$recipientName = isset($name) && trim($name) !== '' ? trim($name) : null;
$greeting = $recipientName ? 'Hola ' . htmlspecialchars($recipientName, ENT_QUOTES, 'UTF-8') : 'Hola';
$ctaUrl = isset($cta_url) && trim($cta_url) !== '' ? trim($cta_url) : '#';
$ctaText = isset($cta_text) && trim($cta_text) !== '' ? trim($cta_text) : 'Ingresar factura';
$invoiceNumber = isset($invoice_number) && trim($invoice_number) !== '' ? trim($invoice_number) : null;
$purchasePlace = isset($purchase_place) && trim($purchase_place) !== '' ? trim($purchase_place) : null;

$headerSrc = $header_src ?? '';
$footerMexanaSrc = $footer_mexana_src ?? '';
$footerConnectSrc = $footer_connect_src ?? '';
$footerFbSrc = $footer_fb_src ?? '';
$footerIgSrc = $footer_ig_src ?? '';
?>
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Factura rechazada</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f2f4f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1c1c1c;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f2f4f8;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:20px;box-shadow:0 12px 30px rgba(15,49,140,0.16);overflow:hidden;">
            <tr>
              <td align="center" style="padding:32px 32px 0 32px;">
                <?php if ($headerSrc !== ''): ?>
                  <img src="<?= $headerSrc ?>" alt="Mexsana - Lo sentimos" width="548" style="max-width:100%;border-radius:30px;display:block;" />
                <?php endif; ?>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 32px 0 32px;">
                <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#00a4ff;"><?= $greeting ?></p>
                <p style="margin:0 0 16px 0;font-size:20px;line-height:1.4;font-weight:700;color:#004ed8;">
                  Te informamos que la factura que subiste en Fresh Game no es válida.
                </p>
                <?php if ($invoiceNumber || $purchasePlace): ?>
                  <p style="margin:0 0 16px 0;font-size:14px;line-height:1.5;color:#0060ff;font-weight:600;">
                    <?= $invoiceNumber ? 'Factura: ' . htmlspecialchars($invoiceNumber, ENT_QUOTES, 'UTF-8') : '' ?>
                    <?= ($invoiceNumber && $purchasePlace) ? ' · ' : '' ?>
                    <?= $purchasePlace ? 'Lugar de compra: ' . htmlspecialchars($purchasePlace, ENT_QUOTES, 'UTF-8') : '' ?>
                  </p>
                <?php endif; ?>
                <p style="margin:0 0 12px 0;font-size:15px;line-height:1.6;color:#333333;">
                  Por favor, asegúrate de que el archivo sea legible, esté en formato JPG, PNG o PDF, y contenga toda la información necesaria para su validación. Por esta razón, los puntos que acumulaste no podrán ser validados.
                </p>
                <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#333333;">
                  Te invitamos a ingresar una nueva factura para seguir acumulando puntos y seguir demostrando que cuando se trata de frescura, tú eres el mejor.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" style="background:#004ed8;border-radius:999px;">
                      <a href="<?= htmlspecialchars($ctaUrl, ENT_QUOTES, 'UTF-8') ?>" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">
                        <?= htmlspecialchars($ctaText, ENT_QUOTES, 'UTF-8') ?>
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:32px 0 0 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;">
                  <tr>
                    <td
                      style="background-color:#00a4ff;border-radius:28px;padding:12px 24px;"
                      bgcolor="#00a4ff"
                    >
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td align="left" style="vertical-align:middle;">
                            <?php if ($footerMexanaSrc !== ''): ?>
                              <img src="<?= $footerMexanaSrc ?>" alt="Mexsana" width="120" style="display:block;border:0;" />
                            <?php endif; ?>
                          </td>
                          <td align="center" style="vertical-align:middle;">
                            <?php if ($footerConnectSrc !== ''): ?>
                              <img src="<?= $footerConnectSrc ?>" alt="Conéctate con lo último" width="160" style="display:block;border:0;" />
                            <?php endif; ?>
                          </td>
                          <td align="right" style="vertical-align:middle;white-space:nowrap;">
                            <?php if ($footerFbSrc !== ''): ?>
                              <a href="https://www.facebook.com/Mexsana" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-right:12px;">
                                <img src="<?= $footerFbSrc ?>" alt="Facebook Mexsana" width="32" style="display:block;border:0;" />
                              </a>
                            <?php endif; ?>
                            <?php if ($footerIgSrc !== ''): ?>
                              <a href="https://www.instagram.com/mexsana" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
                                <img src="<?= $footerIgSrc ?>" alt="Instagram Mexsana" width="32" style="display:block;border:0;" />
                              </a>
                            <?php endif; ?>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px 32px;text-align:center;font-size:12px;color:#7b8299;line-height:1.5;">
                Recibiste este correo porque participaste en la dinámica Fresh Game de Mexsana.<br />
                Si necesitas ayuda, escríbenos respondiendo a este mensaje.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
