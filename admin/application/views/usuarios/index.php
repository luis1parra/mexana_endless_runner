<?php defined('BASEPATH') OR exit('No direct script access allowed'); ?>
<?php ob_start(); ?>

<div class="min-h-screen">
  <header class="sticky top-0 z-10 backdrop-blur bg-[#0b1220]/70 border-b border-white/10">
    <div class="px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h1 class="text-lg font-semibold">Usuarios</h1>
        <span class="ml-2 text-xs text-slate-400">Total: <?= number_format($total) ?></span>
      </div>
      <a href="<?= site_url('usuarios/crear') ?>" class="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-semibold">+ Nuevo</a>
    </div>
  </header>

  <section class="px-4 py-4">
    <form method="get" class="flex gap-2">
      <input name="q" value="<?= html_escape($q) ?>" placeholder="Buscar por nombre, apellido o email"
             class="flex-1 px-3 py-2 rounded-lg bg-[#0f172a] border border-white/10 outline-none focus:ring-2 focus:ring-cyan-300/50" />
      <button class="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-semibold">Buscar</button>
      <a class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/5" href="<?= site_url('usuarios') ?>">Limpiar</a>
    </form>
  </section>

  <section class="px-4 pb-10">
    <?php if ($this->session->flashdata('success')): ?>
      <div class="mb-3 px-4 py-2 rounded-lg bg-green-500/15 text-green-200 border border-green-500/30">
        <?= html_escape($this->session->flashdata('success')) ?>
      </div>
    <?php endif; ?>
    <?php if ($this->session->flashdata('error')): ?>
      <div class="mb-3 px-4 py-2 rounded-lg bg-red-500/15 text-red-200 border border-red-500/30">
        <?= html_escape($this->session->flashdata('error')) ?>
      </div>
    <?php endif; ?>

    <div class="overflow-hidden rounded-xl border border-white/10 shadow">
      <table class="min-w-full text-sm">
        <thead class="bg-white/5 text-slate-400 uppercase text-xs">
          <tr>
            <th class="text-left px-4 py-3">ID</th>
            <th class="text-left px-4 py-3">Nombre</th>
            <th class="text-left px-4 py-3">Apellido</th>
            <th class="text-left px-4 py-3">Email</th>
            <th class="text-left px-4 py-3">Rol</th>
            <th class="text-left px-4 py-3">Creado</th>
            <th class="text-right px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/10">
          <?php if (empty($rows)): ?>
            <tr><td colspan="7" class="px-4 py-6 text-center text-slate-400">No hay usuarios.</td></tr>
          <?php else: foreach ($rows as $u): ?>
            <tr class="hover:bg-white/5">
              <td class="px-4 py-3"><?= (int)$u->id_user_admin ?></td>
              <td class="px-4 py-3"><?= html_escape($u->nombre) ?></td>
              <td class="px-4 py-3"><?= html_escape($u->apellido) ?></td>
              <td class="px-4 py-3"><?= html_escape($u->email) ?></td>
              <td class="px-4 py-3"><span class="px-2 py-1 rounded bg-white/10"><?= html_escape($u->rol) ?></span></td>
              <td class="px-4 py-3"><?= html_escape($u->creado_en) ?></td>
              <td class="px-4 py-3 text-right">
                <a href="<?= site_url('usuarios/editar/'.$u->id_user_admin) ?>" class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/5">Editar</a>
              </td>
            </tr>
          <?php endforeach; endif; ?>
        </tbody>
      </table>
    </div>

    <div class="mt-4"><?= $pagination ?></div>
  </section>
</div>

<?php
$main   = ob_get_clean();
$title  = 'Usuarios';
$active = 'usuarios';
$user   = $this->session->userdata('user');
$this->load->view('layouts/admin_shell', compact('main','title','active','user'));
