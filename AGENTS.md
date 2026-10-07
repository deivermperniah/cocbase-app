## Reglas de comportamiento (obligatorias)

- Haz SOLO el cambio mínimo necesario para resolver lo que se pide. Nada de "mientras estaba aquí, también...".
- No generes código, componentes ni estructuras que no se hayan pedido explícitamente.
- No crees archivos, carpetas ni componentes nuevos salvo que sea estrictamente indispensable para completar el cambio pedido.
- No refactorices, no reorganices ni "mejores" código existente que no forme parte de la tarea.
- No modifiques estilos, layout ni estructura visual si no se pidió específicamente.
- No revises, audites ni comentes sobre partes del código que no estén directamente relacionadas con el cambio solicitado.
- No agregues comentarios, documentación ni explicaciones extra dentro del código salvo que se pida.
- Si una tarea puede resolverse tocando un solo archivo o una sola función, hazlo así. No expandas el alcance.
- No repitas código: antes de crear algo, busca si ya existe en `src/components/` o `src/lib/` y reutilízalo.
- Si tienes dudas sobre el alcance del cambio, pregunta antes de tocar código adicional — no asumas ni "por si acaso" hagas más.

## Stack

- Frontend: React Native con Expo (~54), JavaScript (sin TypeScript).
- Navegación: React Navigation (bottom tabs + native stack).
- Backend: Supabase (auth, base de datos y storage) desde el cliente.
- Estado global: React Context (`AuthContext`, `FavoritesContext`).
- Persistencia de sesión: `AsyncStorage`.
- Iconos: `@expo/vector-icons` (Ionicons, MaterialCommunityIcons).

## Estructura

- `App.js`: punto de entrada; define navegadores (tabs y stack) y providers.
- `src/screens/`: una pantalla por archivo (Bases, BaseList, Favorites, Contribute, Settings, Auth, Panel, NewBase, Review, Images).
- `src/components/`: componentes reutilizables (BaseCard, BaseForm, BaseActionsSheet, DialogProvider, StateMessage, ScreenHeader…).
- `src/context/`: providers de estado global (`AuthContext`, `FavoritesContext`).
- `src/lib/`: lógica y utilidades (`supabase.js`, `theme.js`, `constants.js`, `admin.js`, `baseSubmission.js`, `format.js`, `layout.js`, `dialogs.js`).
- `assets/`: fuentes, iconos e imágenes.

## Convenciones

- Las consultas a Supabase van solo en `src/lib/` y `src/context/`, nunca directamente en las pantallas si ya existe una función.
- Los colores y tipografías salen de `src/lib/theme.js` (`COLORS`, `FONT`); no usar valores sueltos.
- Los datos de configuración de la app van centralizados en `src/lib/constants.js`.
- El ancho de pantalla se maneja con `useIsWide` de `src/lib/layout.js` para adaptar móvil/tablet.
- Los diálogos usan `DialogProvider`; no abrir alertas nativas sueltas.
- Las columnas consultadas de Supabase se definen una sola vez (p. ej. `BASE_COLUMNS`) y se reutilizan.
- Variables de entorno con prefijo `EXPO_PUBLIC_` y declaradas en `.env` (ver `.env.example`).
- Textos de la interfaz en español; código (nombres, variables) en inglés.

## Fuera de alcance por ahora

No agregar tests, linters, TypeScript ni notificaciones push salvo que se pida explícitamente.
## Verificación

- Comprobar el cambio en el dispositivo/emulador o en la app web de Expo.
- No escribir datos de prueba en Supabase.
- No ejecutar builds de EAS salvo que se pida.

## Git y commits

- No ejecutar comandos de git (add, commit, push, branch, etc.) bajo ninguna circunstancia. Nunca.
- Si se pide agrupar cambios para commit: proponer grupos por tema + mensaje, sin ejecutar git.
- Formato: `<tipo>: <descripción breve en inglés, minúsculas, imperativo>`.
- Tipos permitidos: feat, fix, style, refactor, chore, docs.
- Máximo ~60 caracteres, sin punto final.

## Development

Iniciar el servidor de desarrollo de Expo:

```
npm start
```

Atajos: `npm run android`, `npm run ios`, `npm run web` según la plataforma objetivo.

## Documentation

Documentación completa: https://docs.expo.dev

Consultar estas guías antes de trabajar en tareas relacionadas:

- [Navegación con React Navigation](https://reactnavigation.org/docs/getting-started)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Componentes y APIs de Expo](https://docs.expo.dev/versions/latest/)
