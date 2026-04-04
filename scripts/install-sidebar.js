import fs from 'fs';
import path from 'path';

const layoutPath = path.resolve('./src/layouts/Dashboard.astro');
let content = fs.readFileSync(layoutPath, 'utf8');

// Replace everything from <!-- Navigation --> to </Base> (approx line 17 to 257)
const layoutReplacement = `
    <!-- Sidebar Navigation Shell -->
    <aside class="fixed xl:flex left-0 top-0 h-full hidden flex-col bg-surface-container/50 border-r border-outline-variant/15 w-64 z-50">
      <div class="px-8 py-10">
        <h1 class="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <img src="/logo.svg" alt="Logo" class="h-6 w-6" />
          Quotation Pro
        </h1>
        <p class="text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-1 font-bold">Empresa Global</p>
      </div>

      <nav class="flex-1 px-4 space-y-2">
        <a class={\`flex items-center gap-3 px-4 py-3 font-semibold transition-colors duration-200 group \${activeSection === 'dashboard' ? 'text-primary-500 border-r-2 border-primary-500 bg-primary-500/5' : 'text-gray-400 hover:text-white hover:bg-surface-container-low/50'}\`} href="/dashboard">
          <span class="material-symbols-outlined select-none">dashboard</span>
          <span class="font-inter text-sm tracking-tight">Dashboard</span>
        </a>
        <a class={\`flex items-center gap-3 px-4 py-3 font-semibold transition-colors duration-200 group \${activeSection === 'items' ? 'text-primary-500 border-r-2 border-primary-500 bg-primary-500/5' : 'text-gray-400 hover:text-white hover:bg-surface-container-low/50'}\`} href="/items">
          <span class="material-symbols-outlined select-none">inventory_2</span>
          <span class="font-inter text-sm tracking-tight">Ítems</span>
        </a>
        <a class={\`flex items-center gap-3 px-4 py-3 font-semibold transition-colors duration-200 group \${activeSection === 'clients' ? 'text-primary-500 border-r-2 border-primary-500 bg-primary-500/5' : 'text-gray-400 hover:text-white hover:bg-surface-container-low/50'}\`} href="/clients">
          <span class="material-symbols-outlined select-none">group</span>
          <span class="font-inter text-sm tracking-tight">Clientes</span>
        </a>
        <a class={\`flex items-center gap-3 px-4 py-3 font-semibold transition-colors duration-200 group \${activeSection === 'quotes' ? 'text-primary-500 border-r-2 border-primary-500 bg-primary-500/5' : 'text-gray-400 hover:text-white hover:bg-surface-container-low/50'}\`} href="/quotes">
          <span class="material-symbols-outlined select-none">request_quote</span>
          <span class="font-inter text-sm tracking-tight">Cotizaciones</span>
        </a>
        <a class={\`flex items-center gap-3 px-4 py-3 font-semibold transition-colors duration-200 group \${activeSection === 'config' ? 'text-primary-500 border-r-2 border-primary-500 bg-primary-500/5' : 'text-gray-400 hover:text-white hover:bg-surface-container-low/50'}\`} href="/config">
          <span class="material-symbols-outlined select-none">settings</span>
          <span class="font-inter text-sm tracking-tight">Configuración</span>
        </a>
      </nav>

      <div class="p-6">
        <a href="/quotes/new" class="bg-gradient-to-br from-primary-500 to-primary-600 text-white w-full py-4 rounded-xl font-bold text-sm tracking-tight shadow-premium hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-none">
          <span class="material-symbols-outlined text-lg select-none">add</span>
          Nueva Cotización
        </a>
      </div>
    </aside>

    <main class="xl:ml-64 min-h-screen flex flex-col pt-0">
      <!-- Top Navigation Bar -->
      <header class="sticky top-0 z-40 flex justify-between items-center w-full px-4 sm:px-12 py-4 sm:py-6 bg-surface-container-lowest/70 backdrop-blur-3xl border-b border-outline-variant/15 shadow-[0_12px_32px_rgba(0,0,0,0.4)]">
        <div class="flex items-center gap-4 flex-1">
          <!-- Mobile Menu Toggle -->
          <button id="mobile-menu-button" type="button" class="xl:hidden inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:bg-surface-container transition-colors">
            <span class="material-symbols-outlined select-none">menu</span>
          </button>
          
          <div class="relative w-full max-w-md hidden sm:block">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">search</span>
            <input class="w-full bg-surface-container-lowest border-none rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-gray-600 shadow-sm" placeholder="Buscar en datos corporativos..." type="text"/>
          </div>
        </div>

        <div class="flex items-center gap-4 sm:gap-8">
          <nav class="hidden md:flex gap-8">
            <a class="text-primary-500 font-bold tracking-tight text-sm" href="/dashboard">Resumen</a>
            <a class="text-gray-400 hover:text-primary-400 transition-all tracking-tight text-sm" href="#">Analítica</a>
            <a class="text-gray-400 hover:text-primary-400 transition-all tracking-tight text-sm" href="#">Reportes</a>
          </nav>
          
          <div class="flex items-center gap-2 sm:gap-4">
            <button class="text-gray-400 hover:text-primary-500 transition-colors hidden sm:block">
              <span class="material-symbols-outlined select-none">notifications</span>
            </button>
            <button class="text-gray-400 hover:text-primary-500 transition-colors hidden sm:block">
              <span class="material-symbols-outlined select-none">help_outline</span>
            </button>
            
            <!-- User Dropdown Logic (mapped exactly from old code) -->
            <div class="relative flex items-center justify-center">
              <button id="user-menu-button" type="button" class="h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden border-2 border-primary-500/20 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300">
                <div id="user-avatar-initials" class="w-full h-full bg-surface-container flex items-center justify-center text-primary-400 text-xs sm:text-sm font-bold">U</div>
                <img id="user-avatar-image" class="h-full w-full object-cover hidden" alt="Retrato profesional de un ejecutivo" />
              </button>

              <div id="user-menu" class="hidden absolute right-0 top-12 mt-3 w-56 bg-surface-container-lowest rounded-2xl shadow-premium py-2 z-50 border border-outline-variant/15 overflow-hidden transform origin-top-right transition-all duration-200">
                <div class="px-4 py-3 text-xs text-gray-400 border-b border-gray-800">
                  <p class="font-bold text-white truncate" id="user-display-name">Usuario</p>
                  <p id="user-email" class="truncate mt-0.5">usuario@ejemplo.com</p>
                </div>
                <a href="/profile" class="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-surface-container-low transition-colors">
                  <span class="material-symbols-outlined select-none text-sm opacity-50">person</span>
                  <span>Mi perfil</span>
                </a>
                <a href="/config" class="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-surface-container-low transition-colors">
                  <span class="material-symbols-outlined select-none text-sm opacity-50">settings</span>
                  <span>Configuración</span>
                </a>
                <div class="border-t border-gray-800 mt-1 pt-1">
                  <button id="logout-button" class="flex items-center space-x-2 w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors">
                    <span class="material-symbols-outlined select-none text-sm">logout</span>
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            </div>
            <!-- End User Dropdown Logic -->
          </div>
        </div>
      </header>

      <!-- Mobile menu panel -->
      <div id="mobile-menu" class="hidden xl:hidden border-t border-gray-800 bg-surface-container shadow-md fixed w-full top-[73px] sm:top-[89px] z-30">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a href="/dashboard" class={\`block px-3 py-2 rounded-md text-base font-medium \${activeSection === "dashboard" ? "bg-primary-900/30 text-primary-400" : "text-gray-300 hover:bg-gray-800"}\`}>Dashboard</a>
          <a href="/items" class={\`block px-3 py-2 rounded-md text-base font-medium \${activeSection === "items" ? "bg-primary-900/30 text-primary-400" : "text-gray-300 hover:bg-gray-800"}\`}>Gestión de Items</a>
          <a href="/clients" class={\`block px-3 py-2 rounded-md text-base font-medium \${activeSection === "clients" ? "bg-primary-900/30 text-primary-400" : "text-gray-300 hover:bg-gray-800"}\`}>Clientes</a>
          <a href="/quotes" class={\`block px-3 py-2 rounded-md text-base font-medium \${activeSection === "quotes" ? "bg-primary-900/30 text-primary-400" : "text-gray-300 hover:bg-gray-800"}\`}>Cotizaciones</a>
          <a href="/config" class={\`block px-3 py-2 rounded-md text-base font-medium \${activeSection === "config" ? "bg-primary-900/30 text-primary-400" : "text-gray-300 hover:bg-gray-800"}\`}>Configuración</a>
        </div>
      </div>

      <!-- Content Injection -->
      <div class="flex-1 w-full p-4 sm:p-6 lg:p-12 overflow-x-hidden">
        <slot />
      </div>

      <!-- Footer Tonal Base -->
      <footer class="mt-auto px-12 py-8 bg-surface border-t border-outline-variant/15 flex justify-between items-center opacity-60">
        <p class="text-xs font-medium text-gray-500">© 2024 Quotation Pro Enterprise Systems. Todos los derechos reservados.</p>
        <div class="hidden sm:flex gap-8">
          <a class="text-xs font-bold text-gray-400 hover:text-primary-500 transition-colors" href="#">POLÍTICA DE PRIVACIDAD</a>
          <a class="text-xs font-bold text-gray-400 hover:text-primary-500 transition-colors" href="#">ESTADO DEL SERVICIO</a>
          <a class="text-xs font-bold text-gray-400 hover:text-primary-500 transition-colors" href="#">DOCUMENTACIÓN API</a>
        </div>
      </footer>
    </main>
  </div>
</Base>`;

// Find the boundaries
const navStartIdx = content.indexOf('<!-- Navigation -->');
const baseEndIdx = content.lastIndexOf('</Base>');

if (navStartIdx !== -1 && baseEndIdx !== -1) {
    const beforeStr = content.slice(0, navStartIdx);
    const afterStr = content.slice(baseEndIdx);

    const resultStr = beforeStr + layoutReplacement + '\n  </div>\n' + afterStr;
    fs.writeFileSync(layoutPath, resultStr);
    console.log('Layout patched successfully!');
} else {
    console.log('Error: Could not find boundaries');
}
