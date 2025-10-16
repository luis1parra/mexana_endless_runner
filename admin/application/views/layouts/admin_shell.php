<?php defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Variables esperadas:
 * - $user  (array con rol, nombre, apellido)
 * - $title (string)
 * - $main  (html del contenido específico de la pantalla)
 * - $active (string) para resaltar item del menú: 'dashboard' | 'usuarios' | ...
 */

ob_start(); ?>
<div class="min-h-screen">
  <div class="flex">
    <!-- Sidebar -->
    <aside class="hidden md:flex md:flex-col w-64 min-h-screen bg-mxs-card border-r border-mxs-line">
      <div class="px-5 py-4 border-b border-mxs-line">
        <div class="text-lg font-semibold">Mexsana · Admin</div>
        <div class="text-sm text-mxs-muted">Hola, <?= html_escape($user['nombre']) ?></div>
      </div>

      <nav class="flex-1 p-3 space-y-1">
        <div class="mt-3 text-xs uppercase tracking-wider text-mxs-muted px-3">Facturas</div>
        <a href="<?= site_url('dashboard') ?>"
           class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 <?= ($active==='dashboard'?'bg-white/10':'') ?>">
          <span>📄</span><span>Facturas</span>
        </a>

        <?php if ($user['rol'] === 'superadmin'): ?>
          <div class="mt-3 text-xs uppercase tracking-wider text-mxs-muted px-3">Administración</div>
          <a href="<?= site_url('usuarios') ?>"
             class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 <?= ($active==='usuarios'?'bg-white/10':'') ?>">
            <span>👥</span><span>Usuarios</span>
          </a>
          <!-- <a href="#" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5">
            <span>⚙️</span><span>Parámetros</span>
          </a> -->
        <?php endif; ?>

        <!-- <?php if (in_array($user['rol'], ['superadmin','validador'])): ?>
          <div class="mt-3 text-xs uppercase tracking-wider text-mxs-muted px-3">Operación</div>
          <a href="#" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5">
            <span>✅</span><span>Validaciones</span>
          </a>
        <?php endif; ?> -->
      </nav>

      <div class="p-3 border-t border-mxs-line">
        <a class="block w-full text-center px-3 py-2 rounded-lg bg-mxs-brand hover:bg-mxs-brand/90 text-black font-semibold"
           href="<?= site_url('logout') ?>">Salir</a>
      </div>
    </aside>

    <!-- Contenido -->
    <main class="flex-1 min-h-screen">
      <!-- Topbar -->
      <!-- <header class="sticky top-0 z-10 backdrop-blur bg-mxs-bg/70 border-b border-mxs-line">
        <div class="px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button class="md:hidden px-3 py-2 rounded-lg bg-white/5">☰</button>
            <h1 class="text-lg font-semibold"><?= html_escape($title ?? '') ?></h1>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-sm text-mxs-muted hidden sm:inline">Rol: <?= html_escape($user['rol']) ?></span>
            <div class="w-8 h-8 rounded-full bg-mxs-brand/20 grid place-items-center text-mxs-brand">👤</div>
          </div>
        </div>
      </header> -->

      <!-- Aquí va el contenido específico -->
      <?= $main ?? '' ?>
    </main>
  </div>
</div>
<?php
$content = ob_get_clean();
$this->load->view('layouts/admin_master', compact('content'));
