#  Defect Manager

**Система Контроля** — это система управления дефектами (ошибками, заявками и задачами) для команд и предприятий.  
Приложение поддерживает несколько ролей пользователей и позволяет:

- фиксировать и классифицировать дефекты;  
- изменять статусы (новый, в работе, проверка, закрыт);  
- прикреплять файлы и оставлять комментарии;  
- управлять ролями и пользователями через панель администратора.

---

##  Технологический стек

| Область      | Технологии |
|---------------|-------------|
| **Frontend**  | Next.js 15 (App Router, TypeScript), React Hooks, Zustand, TailwindCSS |
| **Backend**   | Node.js, Express, TypeORM, PostgreSQL, JWT, Argon2 |
| **DevOps**    | Docker, Docker Compose, Adminer (GUI для БД) |
| **Прочее**    | Автоматическая инициализация БД и создание администратора при первом запуске |

---

##  Структура проекта

```
Defect_comp/
│
├── backend/              # Серверная часть (Node + TypeORM)
│   ├── src/              # Исходный код
│   ├── seed/seed.js      # Скрипт создания ролей и пользователя admin
│   ├── db-init.sql       # SQL-схема для PostgreSQL
│   ├── Dockerfile        # Сборка backend-сервиса
│   └── .env.example      # Пример конфигурации окружения
│
├── frontend/             # Клиентская часть (Next.js)
│   ├── src/              # Компоненты и страницы
│   ├── Dockerfile        # Сборка frontend-сервиса
│   └── next.config.ts    # Конфигурация Next.js
│
├── docker-compose.yml    # Основной файл запуска всей системы
└── README.md             # Документация (этот файл)
```

---

##  Сервисы Docker Compose

| Сервис      | Назначение | Порт |
|-------------|------------|------|
| 🐘 **db**       | PostgreSQL база данных | `5432` |
| 🔧 **seed**     | Одноразовый контейнер, создаёт роли и пользователя `admin@gmail.com / 1234` | — |
| 🖥 **backend**  | Node.js API сервер | `4000` |
| 💻 **frontend** | Next.js клиент | `3000` |
| 🗄 **adminer**  | Веб-интерфейс для работы с БД | `8080` |

---

##  Требования

- **Docker** + **Docker Compose**  
- **Git** (для клонирования проекта)  
- *(опционально)* Node.js, если запускать локально без Docker

---

##  Быстрый старт (через Docker)

### 1. Клонируйте репозиторий:
```bash
git clone https://github.com/<yourname>/Defect_comp.git
cd Defect_comp
```

### 2. Запустите все сервисы:
```bash
docker compose up -d --build
```

### 3. Подождите:
- создаётся база данных и таблицы (`db-init.sql`);
- выполняется `seed.js` (создаёт роли и администратора);
- запускаются backend и frontend.

### 4. Откройте в браузере:

| Сервис | URL |
|--------|-----|
| 🌐 Frontend | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:4000 |


### 5. Войдите в систему:
```
Email: admin@gmail.com
Пароль: 1234
```

---



## Локальный запуск без Docker

### 1. Создайте PostgreSQL базу:
```sql
CREATE USER devuser WITH PASSWORD 'StrongPass123';
CREATE DATABASE defect_db OWNER devuser;
CREATE SCHEMA app AUTHORIZATION devuser;
```

### 2. Настройте `.env`:
```ini
DB_URL=postgres://devuser:StrongPass123@localhost:5432/defect_db
PORT=4000
JWT_SECRET=somesecret
JWT_EXPIRES=3h
```

### 3. Запустите backend и frontend:
```bash
# Backend
cd backend
npm install
npm run db:seed
npm run dev

# Frontend (в другом терминале)
cd frontend
npm install
npm run dev
```

### 4. Откройте http://localhost:3000

---

##  Роли пользователей

| Роль | Права доступа |
|------|---------------|
| **Admin** | Полный доступ: управление пользователями, проектами, дефектами, статистика, экспорт |
| **Lead** | Управление пользователями (кроме Admin), проектами, дефектами, статистика, экспорт |
| **Manager** | Управление проектами и дефектами, статистика, экспорт |
| **Engineer** | Просмотр и создание дефектов, комментирование (без удаления файлов и экспорта) |

---

## API документация

После запуска backend, Swagger UI доступен по адресу:

**http://localhost:4000/api-docs**

---

##  Структура БД

Основные таблицы в схеме `app`:

| Таблица | Описание |
|---------|----------|
| `users` | Пользователи системы |
| `roles` | Роли (Admin, Lead, Manager, Engineer) |
| `user_roles` | Связь пользователей и ролей (многие ко многим) |
| `projects` | Проекты |
| `defects` | Дефекты (задачи, ошибки) |
| `comments` | Комментарии к дефектам |
| `attachments` | Прикрепленные файлы |
| `stages` | Стадии разработки (опционально) |

---

## Переменные окружения

### Backend (`.env`):
```ini
DB_URL=postgres://devuser:StrongPass123@db:5432/defect_db
PORT=4000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES=24h
```

### Frontend (`.env.local`):
```ini
NEXT_PUBLIC_API_URL=http://localhost:4000
```



## Решение проблем

### Проблема: `Error: connect ECONNREFUSED 127.0.0.1:5432`
**Решение:** База данных не запущена. Убедитесь, что Docker контейнер `db` работает:
```bash
docker compose ps
docker compose logs db
```

### Проблема: `Port 3000 is already in use`
**Решение:** Порт занят другим приложением. Измените порт в `docker-compose.yml` или остановите процесс:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Проблема: `Frontend не подключается к Backend`
**Решение:** Проверьте переменную окружения `NEXT_PUBLIC_API_URL` в `.env.local`:
```ini
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Проблема: `Seed не создал администратора`
**Решение:** Выполните seed вручную:
```bash
docker compose run --rm seed node seed/seed.js
```

