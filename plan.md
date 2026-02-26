📊 Personal Finance Budget App
Product & Technical Specification
🎯 Product Vision

Build a mobile-first personal finance budgeting web app in Spanish that:

Implements the 50/30/20 rule by default

Allows full customization of percentages

Makes spending vs planning visually obvious

Supports family collaboration

Feels calm, clean, modern, and trustworthy

Core philosophy:

"Control total sobre tu dinero, con claridad visual y simplicidad."

The app must feel like a modern fintech dashboard — not like a spreadsheet.

🧱 Core Domain Model
Entities
User

id

clerkId

name

email

createdAt

FamilyGroup

id

name

ownerId

members (relation to users)

IncomeSource

id

userId

name

amount

isActive

createdAt

IncomeDeduction

id

name (e.g. Diezmo)

type: percentage | fixed

value

isActive

BudgetCategory (Top Level)

id

name (Necesidades, Gustos, Ahorro)

defaultPercentage

order

BudgetSubcategory (Max depth: 1)

id

categoryId

name

ExpenseCategory

id

userId

name

color

categoryId

subcategoryId (nullable)

BudgetTemplate

id

userId

name

BudgetTemplateItem

id

templateId

expenseCategoryId

plannedAmount

Budget

id

userId

name (optional)

startDate

endDate

totalIncome

totalPlanned

createdFromTemplateId (nullable)

BudgetIncome

id

budgetId

incomeSourceId

BudgetExpensePlan

id

budgetId

expenseCategoryId

plannedAmount

Expense

id

userId

budgetId

expenseCategoryId

name

amount

date

📦 Modules
1️⃣ Budget Structure Module

Default Categories:

Necesidades (50%)

Gastos Fijos

Gastos Variables Necesarios

Gustos (30%)

Ahorro (20%)

Rules:

Only 1 level of subcategories

Percentages editable

Total must equal 100%

UI Requirements:

Percentage sliders

Live recalculation

Warning if total ≠ 100%

2️⃣ Expense Categories Module

Users can:

Create expense category

Assign to Category > Subcategory

Choose color (20 predefined colors)

Edit / delete

UI:

Grid color picker

Grouped by Category

Clean minimal list layout

3️⃣ Income Module

Users can:

Add income source

Edit name + amount

Activate/deactivate

Display:

Total active income

Clear visual summary

Important:
Income is global.
Budgets select which income sources apply.

4️⃣ Budget Template Module

Reusable monthly structures.

Example:

Plantilla: "Base Mensual"

Necesidades

Renta: 10,000

Agua: 200

Supermercado: 6,000

Gustos

Salidas: 3,000

Ahorro

Inversión: 5,000

Features:

Show totals per category

Show percentages relative to income

Editable

5️⃣ Budget Creation Module

Create:

Name (optional)

Date range

Select template OR build from scratch

Select income sources

Select deductions

Calculation Flow

Sum selected active income

Apply deductions

Result = Available Income

Apply category %

Compare planned expenses vs allowed

Track real expenses dynamically

6️⃣ Budget Dashboard

Core screen.

Display table:

Categoría	% Asignado	$ Asignado	% Planeado	$ Planeado	$ Real

Logic:

% Asignado = category %

$ Asignado = % × available income

% Planeado = planned ÷ available income

Green if within limit

Red if exceeded

Also display:

Total Planeado vs Total Real

Remaining money

Progress bars

7️⃣ Expense Register

Add expense:

Date

Category

Name

Amount

Editable.

UX:

Floating + button (mobile)

Quick modal input

8️⃣ Tithe / Deductions

During budget creation:

Option:
☑ Aplicar Diezmo 10%

Logic:
Income × 0.9 = Available income

Support:

Percentage deduction

Fixed deduction

9️⃣ Family Mode

Features:

Invite via email

Shared budgets

Shared expense categories

Shared expenses

Roles:

Owner

Editor

🧠 Business Rules

Budget category percentages must total 100%.

Only 1 active overlapping budget per user.

Expenses must belong to a budget.

Subcategory depth = 1 max.

Deactivating income does not delete historical data.

Real-time recalculation after expense insert.

Planned expenses should not exceed allowed category percentage (warn, not block).

🎨 UI / UX Design System
Style Direction

Minimal

Calm

Spacious

Professional

Soft shadows

Rounded-xl cards

Large typography

Clear visual hierarchy

Inspired by:

Linear

Notion

Modern fintech dashboards

Layout
Mobile First

Bottom Navigation:

Dashboard

Gastos

Plantillas

Ingresos

Perfil

Floating Action Button:

Nuevo Gasto

Desktop

Left Sidebar Navigation
Main Content Panel
Card-based layout

Colors

Base:

Neutral gray palette

Success:

Green (#16A34A)

Error:

Red (#DC2626)

Primary:

Indigo or Emerald

Category colors customizable (20 options)

🏗 Technical Stack

Frontend:

Next.js (App Router)

TypeScript

Tailwind

shadcn/ui

React Hook Form

Zod

Auth:

Clerk (Google Login)

Database:

PostgreSQL (Docker)

ORM:

Prisma

PWA:

next-pwa

⚠️ Important UI Implementation Rule
MUST USE SHADCN REUSABLE COMPONENTS ONLY

Cursor must:

Use shadcn/ui components for all UI elements

Avoid building custom button, input, modal, or card components from scratch

Reuse:

Button

Card

Input

Select

Dialog

Sheet

DropdownMenu

Table

Badge

Progress

Tabs

Form

Toast

Follow shadcn design tokens and Tailwind config

Maintain consistent spacing and radius

No custom design systems.
No inline styles.
No external UI libraries.

All UI must be built using shadcn primitives and composed cleanly.

🚀 Future Features (Not MVP)

Charts (Recharts)

Savings goals

Recurring expenses

CSV import

Bank sync

AI insights

🎯 Final Product Goal

This app should feel like:

A personal financial control center
Clear. Visual. Empowering.

Not:

A spreadsheet

An ERP

A complex accounting system