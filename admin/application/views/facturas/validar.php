<?php defined('BASEPATH') OR exit('No direct script access allowed'); ?>
<?php ob_start(); ?>

<section class="px-4 py-6 max-w-6xl">
  <?php if ($this->session->flashdata('error')): ?>
    <div class="mb-3 px-4 py-2 rounded-lg bg-red-500/15 text-red-200 border border-red-500/30">
      <?= html_escape($this->session->flashdata('error')) ?>
    </div>
  <?php endif; ?>
  <?php if ($this->session->flashdata('success')): ?>
    <div class="mb-3 px-4 py-2 rounded-lg bg-green-500/15 text-green-200 border border-green-500/30">
      <?= html_escape($this->session->flashdata('success')) ?>
    </div>
  <?php endif; ?>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
    <!-- Card: datos -->
    <div class="bg-mxs-card border border-mxs-line rounded-xl p-4">
      <h2 class="text-base font-semibold mb-4">Datos de la factura</h2>
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div><span class="text-mxs-muted">ID:</span><div class="font-medium"><?= (int)$row->id_factura ?></div></div>
        <div><span class="text-mxs-muted">N° factura:</span><div class="font-medium"><?= html_escape($row->numero_factura) ?></div></div>
        <div><span class="text-mxs-muted">Lugar de compra:</span><div class="font-medium"><?= html_escape($row->lugar_compra) ?></div></div>
        <div><span class="text-mxs-muted">Fecha registro:</span><div class="font-medium"><?= html_escape($row->fecha_registro) ?></div></div>
        <div><span class="text-mxs-muted">Estado actual:</span>
          <div class="font-medium"><?= html_escape($row->estado_valor ?: ('ID '.$row->estado)) ?></div>
        </div>
        <div><span class="text-mxs-muted">Revisado por:</span>
          <div class="font-medium">
            <?= html_escape(trim(($row->admin_nombre ?? '').' '.($row->admin_apellido ?? ''))) ?: '—' ?>
          </div>
        </div>
        <div class="lg:col-span-2">
          <span class="text-mxs-muted">ID user game:</span>
          <div class="font-medium"><?= html_escape($row->id_user_game) ?></div>
        </div>
      </div>
      <!-- Si quieres mostrar catálogo de estados de referencia -->
      <?php if (!empty($estados)): ?>
        <div class="mt-4 text-xs text-mxs-muted">
          <span class="opacity-80">Catálogo de estados:</span>
          <?php foreach ($estados as $e): ?>
            <span class="inline-block px-2 py-1 rounded bg-white/5 border border-mxs-line mr-1 mt-1">
              <?= (int)$e->id_estado_factura ?> · <?= html_escape($e->valor) ?>
            </span>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    </div>

    <!-- Card: foto -->
    <div class="bg-mxs-card border border-mxs-line rounded-xl p-4">
      <h2 class="text-base font-semibold mb-4">Foto de la factura</h2>
      <?php if (!empty($row->foto_factura)): ?>
        <div class="rounded-lg overflow-hidden border border-mxs-line">
          <img src="<?= site_url('uploads/facturas/'.$row->foto_factura) ?>"
               alt="Foto factura" class="w-full h-auto block">
        </div>
        <div class="mt-2 text-sm">
          <a class="underline text-mxs-brand hover:opacity-80" target="_blank"
             href="<?= site_url('uploads/facturas/'.$row->foto_factura) ?>">Abrir en pestaña</a>
        </div>
      <?php else: ?>
        <div class="text-mxs-muted">No hay foto asociada.</div>
      <?php endif; ?>
    </div>
  </div>

  <!-- Acciones -->
  <form method="post" class="mt-6 flex flex-wrap gap-2">
    <?= form_hidden($this->security->get_csrf_token_name(), $this->security->get_csrf_hash()); ?>
    <button name="accion" value="validar"
            class="px-5 py-2 rounded-lg bg-green-400 hover:bg-green-300 text-black font-semibold">
      Validar
    </button>
    <button name="accion" value="rechazar"
            class="px-5 py-2 rounded-lg bg-red-400 hover:bg-red-300 text-black font-semibold">
      Rechazar
    </button>
    <a href="<?= site_url('dashboard') ?>" class="ml-auto px-5 py-2 rounded-lg bg-white/10 hover:bg-white/5">
      Volver
    </a>
  </form>
</section>

<?php
$main   = ob_get_clean();
$title  = 'Validar factura #'.$row->id_factura;
$active = 'dashboard'; // para que en el sidebar quede seleccionado "Facturas"
$this->load->view('layouts/admin_shell', compact('main','title','active','user'));
