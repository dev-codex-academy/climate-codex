# Codex CRM Frontend (Novo CRM App)

## Overview
Codex CRM is a modern, responsive, and dynamic Customer Relationship Management (CRM) application built with React and Vite. It is designed to be highly customizable and multi-tenant, offering robust tools to manage Leads, Clients, Pipelines, Services, and an advanced general Catalogue system.

## Core Features
- **Dynamic Attributes**: Custom schema definitions for entities like Clients, Services, and Leads.
- **Leads & Pipelines**: Intuitive lead management with customizable pipelines and stages.
- **Unified Catalogue**: Manage products, services, and subscriptions with tailored pricing and taxation.
- **Billing & Invoices**: Seamless transition from a 'Won' Lead directly into an Invoice or Active Service.
- **Workflow Automation**: Built-in support for webhooks triggered by various system events (creation, updates, deletion).
- **Role-Based Access Control (RBAC)**: Differentiated experiences for specialized organizational groups.

## Tech Stack
- React 19
- Vite
- Tailwind CSS 4
- Radix UI Components (Accessible UI primitives)
- React Router DOM
- Data manipulation tools (dnd-kit, react-hook-form, react-table)

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation

1. Clone this repository to your local machine.
2. Navigate to the project root directory:
   ```bash
   cd codex-crm/climate-codex
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Development Server
To start the application in development mode with Hot Module Replacement (HMR):
```bash
npm run dev
```
The application will typically be available at `http://localhost:5173/`.

### Building for Production
To create a production-ready optimized build:
```bash
npm run build
```
The compiled assets will be output in the `dist` directory. To preview the build locally:
```bash
npm run preview
```

## Documentation References

The Codex CRM frontend includes robust built-in web documentation components directly accessible within the application:

1. **Interactive API Guide**: Navigating to the `/api` route provides a comprehensive, interactive layout (similar to Postman/Swagger overlays) where developers can find up-to-date cURL commands, payload structures, and base field guides for all supported endpoints (Leads, Clients, Invoices, Catalogue, etc.).
2. **End-User FAQ**: Navigating to the `/faq` route offers an interactive frequently asked questions interface tailored for end-users. It explains the core concepts (Leads vs. Clients), the sales pipelines dynamically, billing semantics, and system capabilities like webhooks.
3. **Internal Architecture**: The `api-back-end.md` file located in the root repository contains the static developer documentation for all endpoints, webhook setups, and dynamic schemas required to integrate correctly.

Both the web interactive documentation (`src/pages/ApiGuide.jsx` and `src/pages/Faq.jsx`) and the static file (`api-back-end.md`) are thoroughly maintained in English to ensure a singular source of truth for international teams.
