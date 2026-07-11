// usar-tema.ts — guarda y aplica el tema (claro/oscuro) elegido por la persona
import { ref, onMounted } from 'vue';

// El CSS busca el atributo data-theme="dark" (así está escrito en todo
// estilos.css / estilos-login.css). Antes acá se guardaba "oscuro"/"claro"
// y como nunca coincidía con "dark", el modo oscuro no se veía nunca aunque
// el botón sí cambiaba de ícono. Este mapa traduce el valor interno en
// español al valor en inglés que el CSS realmente necesita.
const ATRIBUTO_POR_TEMA = { claro: 'light', oscuro: 'dark' } as const;

export function usarTema() {
  const tema = ref<'claro' | 'oscuro'>('claro');

  // Al montar el componente, recupera el tema guardado la última vez.
  onMounted(() => {
    const guardado = localStorage.getItem('saludasist-tema');
    tema.value = guardado === 'oscuro' ? 'oscuro' : 'claro';
    document.documentElement.setAttribute('data-theme', ATRIBUTO_POR_TEMA[tema.value]);
  });

  // Cambia entre claro y oscuro, y lo recuerda para la próxima visita.
  function alternarTema(): void {
    tema.value = tema.value === 'claro' ? 'oscuro' : 'claro';
    document.documentElement.setAttribute('data-theme', ATRIBUTO_POR_TEMA[tema.value]);
    localStorage.setItem('saludasist-tema', tema.value);
  }

  return { tema, alternarTema };
}
