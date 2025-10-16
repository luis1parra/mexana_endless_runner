<?php defined('BASEPATH') OR exit('No direct script access allowed'); ?>
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title><?= isset($title) ? html_escape($title) . ' · ' : '' ?>Admin Mexsana</title>

<!-- Tailwind CDN (modo producción local está OK; en productivo, ideal compilar) -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          // 🎯 Ajusta estos HEX con los colores oficiales Mexsana
          mxs: {
            bg: '#192e7b',     // fondo app
            card: '#0f172a',   // cards
            brand: '#0EA5E9',  // primario (ej: celeste)
            brand2: '#22D3EE', // secundario (ej: aqua)
            text: '#E5E7EB',   // texto principal
            muted: '#94A3B8',  // texto secundario
            line: 'rgba(255,255,255,.08)', // bordes sutiles
          }
        },
        boxShadow:{
          soft: '0 10px 30px rgba(0,0,0,0.25)'
        },
        borderRadius:{
          xl2: '1rem'
        }
      }
    }
  }
</script>

<style>
  :root{
    /* Si prefieres, también puedes usar CSS vars */
  }
</style>
</head>
<body class="bg-[radial-gradient(1200px_600px_at_80%_-20%,rgba(34,211,238,.08),transparent)] bg-mxs-bg text-mxs-text">
  <?= isset($content) ? $content : '' ?>
</body>
</html>
