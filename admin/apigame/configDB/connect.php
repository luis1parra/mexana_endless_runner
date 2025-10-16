<?php
$conexion = new mysqli("localhost:3306","root","SKQeaprtHp49SKQeaprtHp49","mexsana_endless_runner");
//$conexion = new mysqli("localhost:3306","root","","mexsana_endless_runner");
$conexion -> set_charset("utf8");

if ($conexion -> connect_errno) {
  echo "Failed to connect to MySQL: " . $conexion -> connect_error;
  exit();
}

?>