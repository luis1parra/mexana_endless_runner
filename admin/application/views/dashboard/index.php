<?php defined('BASEPATH') or exit('No direct script access allowed');

/** @var array $user */
/** @var array $facturas */
/** @var string $pagination */
/** @var string|null $q */
/** @var int $total */

ob_start(); ?>
<div class="min-h-screen">
  <!-- Layout con sidebar -->
  <div class="flex">
    <!-- Contenido -->
    <main class="flex-1 min-h-screen">
      <header class="sticky top-0 z-10 backdrop-blur bg-[#0b1220]/70 border-b border-white/10">
        <div class="px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h1 class="text-lg font-semibold">Facturas</h1>
            <span class="ml-2 text-xs text-slate-400">Total: <?= number_format($total) ?></span>
          </div>
        </div>
      </header>
      <!-- Filtros -->
      <section class="px-4 py-4">
        <form class="grid grid-cols-1 md:grid-cols-6 gap-2" method="get" action="<?= site_url('dashboard') ?>">
          <input name="lugar_compra" value="<?= html_escape($filters['lugar_compra']) ?>" placeholder="Lugar de compra"
            class="px-3 py-2 rounded-lg bg-mxs-card border border-mxs-line outline-none focus:ring-2 focus:ring-mxs-brand/40" />
          <input name="numero_factura" value="<?= html_escape($filters['numero_factura']) ?>" placeholder="N° factura"
            class="px-3 py-2 rounded-lg bg-mxs-card border border-mxs-line outline-none focus:ring-2 focus:ring-mxs-brand/40" />
          <input type="date" name="fecha_registro" value="<?= html_escape($filters['fecha_registro']) ?>"
            class="px-3 py-2 rounded-lg bg-mxs-card border border-mxs-line outline-none focus:ring-2 focus:ring-mxs-brand/40" />

          <select name="estado"
            class="px-3 py-2 rounded-lg bg-mxs-card border border-mxs-line outline-none focus:ring-2 focus:ring-mxs-brand/40">
            <option value="">— Estado —</option>
            <?php foreach ($estados as $e): ?>
              <option value="<?= (int)$e->id_estado_factura ?>" <?= ((string)$filters['estado'] === (string)$e->id_estado_factura) ? 'selected' : '' ?>>
                <?= html_escape($e->valor) ?>
              </option>
            <?php endforeach; ?>
          </select>

          <input name="id_user_game" value="<?= html_escape($filters['id_user_game']) ?>" placeholder="ID user game"
            class="px-3 py-2 rounded-lg bg-mxs-card border border-mxs-line outline-none focus:ring-2 focus:ring-mxs-brand/40" />

          <select name="id_user_admin"
            class="px-3 py-2 rounded-lg bg-mxs-card border border-mxs-line outline-none focus:ring-2 focus:ring-mxs-brand/40">
            <option value="">— Revisado por —</option>
            <?php foreach ($admins as $a): ?>
              <option value="<?= (int)$a->id_user_admin ?>" <?= ((string)$filters['id_user_admin'] === (string)$a->id_user_admin) ? 'selected' : '' ?>>
                <?= html_escape($a->nombre . ' ' . $a->apellido) ?>
              </option>
            <?php endforeach; ?>
          </select>

          <div class="md:col-span-6 flex gap-2">
            <button class="px-4 py-2 rounded-lg bg-mxs-brand hover:bg-mxs-brand/90 text-black font-semibold">Filtrar</button>
            <a class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/5" href="<?= site_url('dashboard') ?>">Limpiar</a>
            <!-- <div class="ml-auto text-sm text-mxs-muted self-center">Por defecto: estado = 1</div> -->
          </div>
        </form>
      </section>

      <!-- Tabla -->
      <section class="px-4 pb-10 mt-4">
        <div class="overflow-hidden rounded-xl border border-mxs-line shadow-soft">
          <table class="min-w-full text-sm">
            <thead class="bg-white/5 text-mxs-muted uppercase text-xs">
              <tr>
                <th class="text-left px-4 py-3">ID</th>
                <th class="text-left px-4 py-3">N° Factura</th>
                <th class="text-left px-4 py-3">Lugar compra</th>
                <th class="text-left px-4 py-3">Fecha registro</th>
                <th class="text-left px-4 py-3">Estado</th>
                <th class="text-left px-4 py-3">Revisado por</th>
                <th class="text-left px-4 py-3">Foto</th>
                <th class="text-right px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-mxs-line">
              <?php if (empty($facturas)): ?>
                <tr>
                  <td colspan="8" class="px-4 py-6 text-center text-mxs-muted">No hay facturas.</td>
                </tr>
              <?php else: ?>
                <?php foreach ($facturas as $f): ?>
                  <tr class="hover:bg-white/5">
                    <td class="px-4 py-3"><?= (int)$f->id_factura ?></td>
                    <td class="px-4 py-3 font-medium"><?= html_escape($f->numero_factura) ?></td>
                    <td class="px-4 py-3"><?= html_escape($f->lugar_compra) ?></td>
                    <td class="px-4 py-3"><?= html_escape(date('Y-m-d', strtotime($f->fecha_registro))) ?></td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center px-2 py-1 rounded-md text-xs
                  <?= ($f->estado_valor === 'pagada' ? 'bg-green-500/20 text-green-300' : ($f->estado_valor === 'pendiente' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-blue-500/20 text-blue-300')) ?>">
                        <?= html_escape($f->estado_valor) ?> (<?= (int)$f->id_estado_factura ?>)
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <?= html_escape(trim(($f->admin_nombre ?? '') . ' ' . ($f->admin_apellido ?? ''))) ?: '<span class="text-mxs-muted">—</span>' ?>
                    </td>
                    <td class="px-4 py-3">
                      <?php if (!empty($f->foto_factura)): ?>
                        <a class="underline text-mxs-brand hover:opacity-80" href="<?= site_url('uploads/facturas/' . $f->foto_factura) ?>" target="_blank">Ver</a>
                      <?php else: ?>
                        <span class="text-mxs-muted">—</span>
                      <?php endif; ?>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <a href="<?= site_url('facturas/validar/' . $f->id_factura) ?>"
                        class="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/5">Validar</a>
                    </td>
                  </tr>
                <?php endforeach; ?>
              <?php endif; ?>
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex items-center justify-between text-sm text-mxs-muted">
          <div>Mostrando <?= count($facturas) ?> de <?= number_format($total) ?></div>
          <!-- Puedes seguir usando la paginación manual o $pagination si personalizaste su HTML -->
          <?= !empty($pagination) ? '<div class="prose">' . $pagination . '</div>' : '' ?>
        </div>
      </section>

    </main>
  </div>
</div>
<?php
$main   = ob_get_clean();
$title  = 'Facturas';
$active = 'dashboard';
// Renderiza el shell (sidebar persistente)
$this->load->view('layouts/admin_shell', compact('main', 'title', 'active', 'user'));
