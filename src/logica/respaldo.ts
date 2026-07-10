// respaldo.ts — exporta o importa TODOS los datos de la app como un
// archivo .json, para no perder todo si se borra el navegador.
const CLAVES = [
  'saludasist-usuarios',
  'saludasist-historial',
  'saludasist-tema',
  'saludasist-disponibilidad',
  'saludasist-asignaciones',
  'saludasist-catalogo-enfermedades',
  'saludasist-categorias',
];

// Descarga un archivo .json con todo lo guardado en localStorage.
export function exportarRespaldo(): void {
  const datos: Record<string, string | null> = {};
  CLAVES.forEach(clave => { datos[clave] = localStorage.getItem(clave); });

  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = `saludasist-respaldo-${new Date().toISOString().split('T')[0]}.json`;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}

// Lee un archivo .json de respaldo y restaura los datos en localStorage.
export function importarRespaldo(archivo: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => {
      try {
        const datos = JSON.parse(lector.result as string);
        CLAVES.forEach(clave => { if (datos[clave]) localStorage.setItem(clave, datos[clave]); });
        resolve();
      } catch {
        reject(new Error('El archivo no es un respaldo válido.'));
      }
    };
    lector.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    lector.readAsText(archivo);
  });
}
