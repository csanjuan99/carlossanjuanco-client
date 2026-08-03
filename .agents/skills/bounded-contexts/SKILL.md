---
name: bounded-contexts
description: >-
  Aplica arquitectura Bounded Context a proyectos. Usa al crear nueva estructura de carpetas,
  reorganizar código legacy, o decidir dónde colocar archivos. Trigger: reorganizar carpetas,
  nueva feature, migración clean architecture, o preguntar por estructura de proyecto.
---

# Bounded Context

Filosofía de estructura de carpetas centrada en el **momentum de desarrollo**: en el momento que estás desarrollando, pregúntate:

> **¿Lo que estoy desarrollando se usa en más de un módulo?**

Si la respuesta es **sí** → `shared/`
Si la respuesta es **no** → dentro del módulo específico

## Estructura Base

```
src/
├── modules/      # módulos de dominio (features)
└── shared/       # recursos compartidos entre módulos
```

---

## Decision Tree

```
¿Se usa en +1 módulo?
├─ SÍ → shared/
│    └─ ¿Qué tipo de archivo?
│       ├─ Contextos React      → shared/contexts/
│       ├─ Utilidades          → shared/utils/
│       ├─ Adaptadores         → shared/adapters/
│       ├─ Servicios           → shared/services/
│       ├─ i18n                → shared/i18n/
│       ├─ Constantes          → shared/constants/
│       ├─ Estilos             → shared/styles/
│       ├─ Assets              → shared/assets/
│       ├─ Componentes UI      → shared/components/
│       ├─ Hooks               → shared/hooks/
│       ├─ Modelos             → shared/models/
│       ├─ Tipos               → shared/types/
│       └─ Errores             → shared/errors/
│
└─ NO → modules/[nombre-modulo]/
         └─ ¿Se usa en +1 página?
            ├─ SÍ → modules/[modulo]/shared/
            └─ NO → modules/[modulo]/pages/[pagina]/
```

---

## shared/ — Elementos Compartidos

Carpetas por tipo de elemento. No todas existen siempre; solo las que el proyecto necesita.

### Estructura de shared/

```
shared/
├── contexts/          # Contextos React (PascalCase)
├── utils/             # Funciones utilitarias
├── adapters/          # Adaptadores (DB, storage, etc.)
├── services/          # Servicios (API, auth, etc.)
├── i18n/              # Internacionalización
├── constants/        # Constantes globales
├── styles/            # Estilos globales
├── assets/            # Imágenes, fuentes, iconos
├── components/        # Componentes genéricos (PascalCase)
│   └── [component]/
│       └── [ComponentName].tsx
├── hooks/             # Hooks reutilizables
├── models/            # Modelos de datos
├── types/             # Tipos globales
└── errors/            # Clases de errores
```

### shared/components/ — Estructura Especial

Los componentes dentro de `shared/components/` **siempre** van en carpetas por nombre:

```
shared/components/
├── ui/
│   └── collapsible.tsx
├── themed-view.tsx
├── themed-text.tsx
└── profile-navbar/
    └── ProfileNavbar.tsx
```

**Nunca** dejar componentes sueltos en la raíz de `components/`.

---

## modules/ — Módulos de Dominio

Cada módulo representa un dominio del negocio. Contiene páginas y recursos compartidos entre páginas de ese módulo.

### Estructura de un módulo

```
modules/[dominio]/
├── pages/
│   └── [pagina]/
│       └── index.tsx
└── shared/
    ├── services/
    ├── contexts/
    ├── hooks/
    ├── components/
    └── ...
```

### pages/

Cada página es una carpeta con su `index.{tsx,vue,etc}`:

```
modules/auth/pages/
├── login/
│   └── index.tsx
└── sign-up/
    └── index.tsx
```

### shared/ (por módulo)

Recursos compartidos entre páginas del mismo módulo:

```
modules/auth/shared/
├── services/
│   └── auth.service.ts
├── contexts/
│   └── auth.context.tsx
└── hooks/
    └── use-auth.ts
```

---

## Naming Conventions

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Archivos de código | `snake-case` + sufijo | `location.service.ts`, `theme.constants.ts` |
| Componentes UI | `PascalCase` | `ProfileNavbar.tsx`, `ThemedView.tsx` |
| Contextos | `PascalCase` | `AuthContext.tsx`, `ThemeContext.tsx` |
| Hooks | `camelCase` con prefijo `use` | `use-theme.ts`, `use-auth.ts` |

### Reglas

- **JSDoc siempre** — nunca comentarios inline
- **Services/Adapters** — usar singleton:
  ```ts
  export const authService = {
    login: async () => { ... },
  };
  ```
- **Constantes** — `export const`
- **Types/Interfaces** — `export type` o `export interface`

---

## Por Framework

### Expo / React Native

Mantener `app/` en raíz (Expo Router entry points):

```
src/
├── app/              # Expo Router (no tocar)
├── shared/
│   ├── adapters/
│   ├── services/
│   └── components/
└── modules/
    └── [dominio]/
```

### React Web (Next.js, Remix, Vite)

`shared/` puede incluir `routes/`:

```
shared/
├── routes/
│   ├── index.ts
│   └── paths.ts
└── ...
```

Entry point importa desde módulos:

```ts
// shared/routes/index.ts
export const routes = {
  '/': 'modules/home/pages/index.tsx',
  '/tasks': 'modules/tasks/pages/list/index.tsx',
};
```

---

## Guía de Migración: dutties-apollo

### Estructura Actual

```
src/
├── app/           # Expo Router
├── components/   # Componentes
├── constants/    # theme.ts
├── core/         # auth, db, http
├── features/     # account, tasks, sync
├── hooks/        # use-theme, use-color-scheme
└── types/        # tipos globales
```

### Mapeo de Migración

| Actual | Nuevo | Notas |
|--------|-------|-------|
| `src/app/` | `src/app/` | Se mantiene |
| `src/components/` | `src/shared/components/` | Mover todos |
| `src/hooks/` | `src/shared/hooks/` | Mover todos |
| `src/constants/theme.ts` | `src/shared/constants/theme.constants.ts` | Renombrar |
| `src/types/` | `src/shared/types/` | Mover todos |
| `src/core/auth/` | `src/shared/services/auth.service.ts` | Consolidar a singleton |
| `src/core/db/` | `src/shared/adapters/` | Mover adaptadores |
| `src/core/http/` | `src/shared/services/http.service.ts` | Consolidar a singleton |
| `src/features/account/` | `src/modules/account/` | Convertir a módulo |
| `src/features/tasks/` | `src/modules/tasks/` | Convertir a módulo |
| `src/features/sync/` | `src/modules/sync/` | Convertir a módulo |

### Estructura Resultado

```
src/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   └── explore.tsx
├── shared/
│   ├── adapters/
│   │   ├── db.adapter.ts
│   │   └── token-store.adapter.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── http.service.ts
│   ├── constants/
│   │   └── theme.constants.ts
│   ├── components/
│   │   ├── ui/
│   │   │   └── collapsible.tsx
│   │   ├── animated-icon/
│   │   │   └── AnimatedIcon.tsx
│   │   ├── themed-view.tsx
│   │   ├── themed-text.tsx
│   │   ├── external-link.tsx
│   │   ├── app-tabs.tsx
│   │   ├── web-badge.tsx
│   │   └── hint-row.tsx
│   ├── hooks/
│   │   ├── use-theme.ts
│   │   └── use-color-scheme.ts
│   └── types/
│       └── css.d.ts
├── modules/
│   ├── account/
│   │   ├── pages/
│   │   │   └── profile/
│   │   │       └── index.tsx
│   │   └── shared/
│   │       ├── presentation/
│   │       │   ├── account-banner.tsx
│   │       │   ├── account-sheet.tsx
│   │       │   └── auth-context.tsx
│   │       └── domain/
│   │           └── session.ts
│   ├── tasks/
│   │   ├── pages/
│   │   │   ├── today/
│   │   │   │   └── index.tsx
│   │   │   └── task-form/
│   │   │       └── index.tsx
│   │   └── shared/
│   │       ├── presentation/
│   │       │   └── use-today-tasks.ts
│   │       ├── domain/
│   │       │   └── task.ts
│   │       └── data/
│   │           └── task-repository.ts
│   └── sync/
│       └── shared/
│           └── sync-engine.ts
```

### Pasos Sugeridos para Migración

1. **Crear estructura** — crear carpetas `shared/` y `modules/`
2. **Mover shared** — constants, types, hooks, components genéricos
3. **Mover core** — consolidar a services y adapters
4. **Convertir features** — crear módulos con pages/ y shared/
5. **Actualizar imports** — corregir rutas en todo el proyecto

> **Nota:** La migración es un proceso independiente de la skill. La skill solo guía la estructura.

---

## Ejemplo: Crear nueva página en dutties-apollo

1. **¿Se usa en más de un módulo?**
   - NO → va en `modules/[dominio]/pages/[pagina]/`

2. **¿Se usa en más de una página del mismo módulo?**
   - SÍ → va en `modules/[dominio]/shared/`
   - NO → va directamente en `modules/[dominio]/pages/[pagina]/`

3. **Ejemplo**: Nueva página "settings" en account

   ```
   modules/account/pages/settings/index.tsx
   ```

   Si necesita un hook compartido con otras páginas de account:
   ```
   modules/account/shared/hooks/use-account-settings.ts
   ```