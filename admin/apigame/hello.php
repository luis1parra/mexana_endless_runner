<?php
include 'configDB/connect.php';
include 'configDB/auth.php';
include 'utils/header.php';

require_auth();

$jsonString = file_get_contents('php://input');

echo "HOLAAAAAAAAA";