# cocbase

App móvil para compartir y descubrir bases de Clash of Clans: sube fotos, guarda tus favoritas y administra el catálogo con roles (usuario / admin).

## Stack

- React Native + Expo (~54), JavaScript.
- React Navigation (tabs + stack).
- Supabase (auth, base de datos y storage) desde el cliente.

## Estructura

```text
App.js                  # Navegadores y providers
src/
├── screens/            # Pantallas (Bases, Favoritos, Contribuir, Panel, Ajustes…)
├── components/         # Componentes reutilizables
├── context/            # AuthContext y FavoritesContext
└── lib/                # Supabase, tema, constantes y utilidades
assets/                 # Fuentes, iconos e imágenes
```

## Puesta en marcha

1. Instala dependencias:

   ```sh
   npm install
   ```

2. Crea `.env` a partir de `.env.example`:

   ```sh
   EXPO_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   ```

3. Inicia la app:

   ```sh
   npm start
   ```

## Comandos

| Comando | Acción |
| :-- | :-- |
| `npm start` | Servidor de desarrollo de Expo |
| `npm run android` | Abre la app en Android |
| `npm run ios` | Abre la app en iOS |
| `npm run web` | Abre la app en el navegador |
