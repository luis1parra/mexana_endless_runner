<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin · Iniciar sesión</title>
<style>
  :root{--bg:#0f172a;--card:#111827;--muted:#94a3b8;--acc:#22d3ee;--err:#f87171;}
  *{box-sizing:border-box} body{margin:0;background:linear-gradient(135deg,#0b1220,#111827);}
  .wrap{min-height:100vh;display:grid;place-items:center;padding:24px}
  .card{width:100%;max-width:380px;background:rgba(17,24,39,.9);border:1px solid rgba(255,255,255,.06);
        border-radius:16px;padding:28px;color:#e5e7eb;backdrop-filter:blur(10px);box-shadow:0 10px 40px rgba(0,0,0,.4)}
  h1{margin:0 0 8px;font-size:22px}
  p.sub{margin:0 0 20px;color:var(--muted);font-size:14px}
  label{display:block;margin:14px 0 6px;font-size:13px;color:#cbd5e1}
  input{width:100%;padding:12px 14px;border-radius:12px;border:1px solid rgba(148,163,184,.25);
        background:#0b1220;color:#e5e7eb;outline:none}
  input:focus{border-color:var(--acc);box-shadow:0 0 0 3px rgba(34,211,238,.15)}
  .btn{width:100%;margin-top:18px;padding:12px 14px;border:none;border-radius:12px;background:linear-gradient(90deg,#22d3ee,#06b6d4);
       color:#021018;font-weight:600;cursor:pointer}
  .foot{margin-top:16px;text-align:center;color:#64748b;font-size:12px}
  .error{margin:0 0 12px;padding:10px;border-radius:10px;background:rgba(248,113,113,.15);color:#fecaca;font-size:13px}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <h1>Bienvenido</h1>
    <p class="sub">Panel administrativo</p>

    <?php if ($this->session->flashdata('error')): ?>
      <div class="error"><?= html_escape($this->session->flashdata('error')) ?></div>
    <?php endif; ?>

    <?= form_open('login'); ?>
      <label for="email">Email</label>
      <input type="email" id="email" name="email" required maxlength="255" autocomplete="username" />

      <label for="password">Contraseña</label>
      <input type="password" id="password" name="password" required minlength="8" autocomplete="current-password" />

      <button class="btn" type="submit">Entrar</button>
    <?= form_close(); ?>

    <div class="foot">Roles: superadmin · validador</div>
  </div>
</div>
</body>
</html>
