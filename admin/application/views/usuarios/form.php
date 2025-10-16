<?php defined('BASEPATH') OR exit('No direct script access allowed'); ?>
<?php
  $is_edit = !empty($is_edit);
  $action  = $is_edit ? site_url('usuarios/editar/'.$row->id_user_admin) : site_url('usuarios/crear');
  $val = function($field, $default='') use($is_edit,$row) {
    if ($is_edit && isset($row->$field)) return html_escape($row->$field);
    return html_escape(set_value($field, $default));
  };
?>
<?php ob_start(); ?>

<div class="min-h-screen">
  <header class="sticky top-0 z-10 backdrop-blur bg-[#0b1220]/70 border-b border-white/10">
    <div class="px-4 py-3 flex items-center justify-between">
      <h1 class="text-lg font-semibold"><?= $is_edit ? 'Editar usuario' : 'Crear usuario' ?></h1>
      <a href="<?= site_url('usuarios') ?>" class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/5">Volver</a>
    </div>
  </header>

  <section class="px-4 py-6 max-w-3xl">
    <?php if ($this->session->flashdata('error')): ?>
      <div class="mb-3 px-4 py-2 rounded-lg bg-red-500/15 text-red-200 border border-red-500/30">
        <?= html_escape($this->session->flashdata('error')) ?>
      </div>
    <?php endif; ?>

    <form method="post" action="<?= $action ?>" class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#0f172a] border border-white/10 rounded-xl p-4">
      <?= form_hidden($this->security->get_csrf_token_name(), $this->security->get_csrf_hash()); ?>

      <div>
        <label class="block text-sm text-slate-300 mb-1">Nombre</label>
        <input name="nombre" value="<?= $val('nombre') ?>" required maxlength="100"
               class="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-cyan-300/40">
      </div>

      <div>
        <label class="block text-sm text-slate-300 mb-1">Apellido</label>
        <input name="apellido" value="<?= $val('apellido') ?>" required maxlength="100"
               class="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-cyan-300/40">
      </div>

      <div>
        <label class="block text-sm text-slate-300 mb-1">Rol</label>
        <?php $r = $val('rol'); ?>
        <select name="rol" required
                class="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-cyan-300/40">
          <option value="superadmin" <?= $r==='superadmin'?'selected':'' ?>>superadmin</option>
          <option value="validador"  <?= $r==='validador'?'selected':''  ?>>validador</option>
        </select>
      </div>

      <div>
        <label class="block text-sm text-slate-300 mb-1">Email</label>
        <input type="email" name="email" value="<?= $val('email') ?>" required maxlength="255" autocomplete="username"
               class="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-cyan-300/40">
      </div>

      <div class="<?= $is_edit ? 'md:col-span-1' : 'md:col-span-1' ?>">
        <label class="block text-sm text-slate-300 mb-1">Contraseña <?= $is_edit?'<span class="text-slate-400">(dejar en blanco para no cambiar)</span>':'' ?></label>
        <input type="password" name="password" minlength="<?= $is_edit?0:8 ?>" <?= $is_edit?'':'required' ?> autocomplete="new-password"
               class="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-cyan-300/40">
      </div>

      <div class="<?= $is_edit ? 'md:col-span-1' : 'md:col-span-1' ?>">
        <label class="block text-sm text-slate-300 mb-1">Confirmar contraseña</label>
        <input type="password" name="password_confirm" <?= $is_edit?'':'required' ?> autocomplete="new-password"
               class="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 outline-none focus:ring-2 focus:ring-cyan-300/40">
      </div>

      <div class="md:col-span-2 flex justify-end gap-2 pt-2">
        <a href="<?= site_url('usuarios') ?>" class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/5">Cancelar</a>
        <button class="px-5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-semibold">
          <?= $is_edit ? 'Guardar cambios' : 'Crear usuario' ?>
        </button>
      </div>
    </form>
  </section>
</div>

<?php
$main   = ob_get_clean();
$title  = $is_edit ? 'Editar usuario' : 'Crear usuario';
$active = 'usuarios';
$user   = $this->session->userdata('user');
$this->load->view('layouts/admin_shell', compact('main','title','active','user'));
