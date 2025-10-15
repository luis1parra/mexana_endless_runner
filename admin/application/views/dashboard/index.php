<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dashboard</title>
<style>body{margin:0;font-family:ui-sans-serif,system-ui;background:#0f172a;color:#e5e7eb}
nav{display:flex;justify-content:space-between;align-items:center;padding:12px 18px;background:#111827;border-bottom:1px solid rgba(255,255,255,.06)}
main{padding:24px} a{color:#22d3ee;text-decoration:none}</style></head>
<body>
<nav>
  <div>📊 Dashboard</div>
  <div>Hola, <?= html_escape($user['nombre'].' '.$user['apellido']) ?> (<?= html_escape($user['rol']) ?>) · <a href="<?= site_url('logout') ?>">Salir</a></div>
</nav>
<main>
  <h2>¡Listo!</h2>
  <p>Ya estás dentro del panel.</p>
</main>
</body></html>
