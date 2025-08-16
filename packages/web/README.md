# Simple PW Web Dashboard

Веб-интерфейс для Simple Playwright Reporter - современный dashboard для просмотра и анализа результатов Playwright тестов.

## Технологический стек

- **React 18** с TypeScript
- **Vite** для сборки и разработки
- **Tailwind CSS** для стилизации
- **TanStack Query** для управления server state
- **Zustand** для client state
- **React Router** для маршрутизации
- **Axios** для HTTP запросов
- **Recharts** для графиков и визуализации

## Разработка

### Установка зависимостей

```bash
pnpm install
```

### Запуск в режиме разработки

```bash
pnpm dev
```

Приложение будет доступно по адресу http://localhost:3000

### Сборка для продакшена

```bash
pnpm build
```

### Проверка типов

```bash
pnpm type-check
```

### Линтинг

```bash
pnpm lint
```

## Конфигурация

Скопируйте `.env.example` в `.env` и настройте переменные окружения:

```bash
cp .env.example .env
```

### Переменные окружения

- `VITE_API_URL` - URL API сервера (по умолчанию: http://localhost:8080)
- `VITE_DEV_MODE` - Режим разработки (true/false)

## Структура проекта

```
src/
├── components/          # Переиспользуемые компоненты
│   ├── ui/             # Базовые UI элементы
│   ├── layout/         # Layout компоненты
│   └── features/       # Feature-specific компоненты
├── pages/              # Страницы приложения
├── hooks/              # Custom React hooks
├── services/           # API сервисы
├── types/              # TypeScript типы
├── utils/              # Утилиты
├── stores/             # Zustand stores
├── config/             # Конфигурация
└── App.tsx             # Главный компонент
```

## Интеграция с API

Веб-интерфейс взаимодействует с Fastify API сервером через REST endpoints. Убедитесь, что API сервер запущен на порту 8080 (или настройте `VITE_API_URL` соответственно).
