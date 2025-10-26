<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

class corfasMail {
    function sendEmail($to, $subject, $body, $pdf1, $pdf2) {
        $mail = new PHPMailer();
        // $mail->SMTPDebug  = 1; // descomentar solo para debuggear
        $mail->isSMTP();
        $mail->CharSet = 'UTF-8';
        $mail->Host       = 'mail.atmos.com.co';
        $mail->Port       =  587;

        // $mail->Host       = 'smtp.office365.com';
        // $mail->Port       = 587;
        $mail->SMTPSecure = 'tls';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'experience@atmos.com.co';
        $mail->Password   = 'Experience2024**';
        //$mail->Username   = 'administrativo@atmosfera.co';
        //$mail->Password   = 'ATMsas2022**';
        $mail->addAttachment("../uploads/photo/$pdf1");
        $mail->addAttachment("../uploads/photo/$pdf2");
        try {
            $mail->setFrom('administrativo@atmosfera.co', 'Atmos');
            for($i = 0; $i < sizeof($to); $i++) {
                $mail->addAddress($to[$i]);
            }

            $mail->Subject = $subject;
            $mail->Body    = $body;
            $mail->IsHTML(true);

            $mail->send();
        } catch(Exception $e) {
            echo $e;
        }
    }
}

?>