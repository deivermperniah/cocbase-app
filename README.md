# cocbase

App móvil (Expo / React Native) de bases de Clash of Clans: galería de diseños por nivel de ayuntamiento y pantalla de colaboración. Es la parte móvil del producto **cocbase**, junto a `cocbase-web-admin` y `cocbase-web`, con backend en **Supabase**.

## Stack

- Expo SDK 54 · React Native 0.81 · React 19
- React Navigation (bottom tabs)
- Supabase (`@supabase/supabase-js`) para Postgres + Storage
- `expo-font` con la tipografía **LilitaOne** (UI en español, tema oscuro)

## Estructura

```
.
├── App.js                    # navegación de tabs + carga de fuentes/splash
├── index.js                  # entrypoint (registerRootComponent)
├── app.json                  # configuración de Expo
├── eas.json                  # perfiles de build (development/preview/production)
├── AGENTS.md                 # reglas de trabajo y convenciones de commits
├── assets/
│   ├── fonts/LilitaOne-Regular.ttf
│   ├── townhalls/th3..th18.webp   # imágenes de ayuntamiento (1024px)
│   └── icon.png, adaptive-icon.png, splash-icon.png, favicon.png
└── src/
    ├── lib/supabase.js       # cliente Supabase (usa variables de entorno)
    └── screens/
        ├── BasesScreen.js    # grilla de ayuntamientos + lista de bases + modales
        └── ColaborarScreen.js
```

## Funcionalidad

- **Bases**: grilla de niveles de ayuntamiento (TH3–TH18). Al elegir un nivel, consulta la tabla `bases` filtrando por `level_th` y ordenando por `created_at` desc.
- Filtros por tipo: `Todos`, `Guerra`, `Liga`, `Mejora`, `Recursos` (modal informativo con descripciones).
- Cada base muestra imagen, badge **Nuevo** (≤ 7 días), botón **Copiar Base** (`link` a Clash of Clans) y **Detalles** (diseñador y fecha).
- Manejo de estados: cargando, sin conexión (con reintento) y lista vacía.
- **Colaborar**: botones de contacto por WhatsApp y Telegram.

## Requisitos

- Node 18+ y npm
- Cuenta de Expo (`owner: deivermperniah`) para builds con EAS
- Opcional: Android SDK / Xcode para builds nativos locales

## Variables de entorno

`.env` en la raíz (**no versionado**, está en `.gitignore`):

```
EXPO_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

En los builds **EAS** estas variables se definen como *Environment Variables* del proyecto (entornos `production`, `preview`, `development`). No basta con `.env`, porque EAS sube el proyecto respetando `.gitignore` y el archivo no se incluye; si faltan, `createClient` falla y la app se cierra al iniciar.

## Ejecución local

```bash
npm install
npm start          # Metro
npm run android    # emulador/dispositivo Android
npm run ios        # simulador iOS
npm run web        # navegador
```

## Builds con EAS

```bash
eas build --profile development --platform android   # dev client (requiere Metro activo)
eas build --profile preview     --platform android   # APK standalone (sin localhost)
eas build --profile production  --platform android
```

- `development`: dev client, `distribution: internal`.
- `preview`: APK instalable que corre solo (solo necesita internet para Supabase).
- `production`: `autoIncrement` de versión.

## Identificadores

| Campo | Valor |
|---|---|
| Nombre visible (instalado) | `cocbase` |
| slug | `cocbase` |
| Android package | `com.deivermperniah.cocbase` |
| EAS projectId | `3d21cd56-ee24-49c1-89e8-c55f5998b251` |
| owner | `deivermperniah` |

## Responsive

- Breakpoint tablet: `width >= 600` (vía `useWindowDimensions`, reacciona a rotación).
- Ancho máximo de contenido: `1200`, centrado.
- Teléfono: 2 columnas de ayuntamientos y 1 de bases.
- Tablet: 3 columnas de ayuntamientos y 2 de bases.
- El layout de teléfono se mantiene sin cambios.

## Assets

- Imágenes de ayuntamiento: `assets/townhalls/th{N}.webp`, `N` de 3 a 18, redimensionadas a 1024px y calidad 85.
- El mapeo nivel → imagen está en `townHallImages` (`src/screens/BasesScreen.js`); se muestran con `resizeMode="cover"` en un contenedor sin padding.

## Backend (Supabase)

Proyecto ref: `iskeyckfeykxruooiasn`.

### Tabla `public.bases`

| Columna | Tipo |
|---|---|
| `id` | uuid (PK) |
| `created_at` | timestamptz |
| `link` | text |
| `type` | text |
| `level_th` | integer |
| `url_foto` | text |
| `code` | text |

RLS habilitada. Políticas:

- `public_read_bases` → `SELECT` para `anon` y `authenticated` (lectura pública de la app).
- `admin_manage_bases` → `ALL` para `authenticated` cuyo email sea `deivermph@gmail.com`.

### Storage

Bucket `bases-fotos` (público). Políticas en `storage.objects`, todas restringidas al email admin `deivermph@gmail.com`:

- `admin_select_bases_fotos` → `SELECT` (necesaria para `.list()` del panel admin).
- `admin_insert_bases_fotos` → `INSERT` (extensiones `jpg`, `jpeg`, `png`, `webp`).
- `admin_delete_bases_fotos` → `DELETE`.

La lectura pública de imágenes (`/storage/v1/object/public/bases-fotos/...`) no requiere política porque el bucket es público.

> Nota: las políticas de escritura del Storage están atadas al email admin porque `cocbase-web-admin` inicia sesión con `signInWithPassword` usando ese correo y luego hace `list`/`upload`/`remove`.

## Convenciones de commits

Definidas en `AGENTS.md`: formato `tipo: descripción breve en inglés, minúsculas, imperativo`; tipos permitidos `feat`, `fix`, `style`, `refactor`, `chore`, `docs`; máx. ~60 caracteres, sin punto final.
