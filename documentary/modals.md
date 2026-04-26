# Mini ERP - Database Schema (V1)

## Overview

This system is built around 3 core entities:

- Student
- Class
- Payment

Relationships:
- A Student belongs to one Class
- A Class has many Students
- A Student has many Payments
- A Payment belongs to one Student

---

## Entity: Student

| Field            | Type        | Description                         |
|------------------|------------|-------------------------------------|
| id               | Long (PK)  | Unique identifier                  |
| full_name        | String     | Student full name (mapped as `fullName`) |
| phone            | String     | Unique phone number                |
| enrollment_date  | LocalDate  | Date of enrollment (mapped as `enrollmentDate`) |
| status           | Enum       | ACTIVE / ON_HOLD / DROPPED         |
| classe           | FK         | Link to Classe                     |

--- 

## Entity: Classe

| Field            | Type        | Description                         |
|------------------|------------|-------------------------------------|
| id               | Long (PK)  | Unique identifier                  |
| name             | String     | e.g. "English B2 Morning"          |
| subject          | String     | Teaching subject (e.g. "English")  |
| level            | String     | A1 → C2                            |
| schedule         | Enum       | MORNING / EVENING / NIGHT          |
| teacher          | String     | Teacher name                       |
| max_capacity     | Integer    | Max number of students (mapped as `maxCapacity`) |
| start_date       | LocalDate  | Start date of the class            |
| end_date         | LocalDate  | End date of the class              |
| archived         | Boolean    | Class archived or not              |

---

## Entity: Payment (Not yet implemented)

| Field            | Type        | Description                         |
|------------------|------------|-------------------------------------|
| id               | Long (PK)  | Unique identifier                  |
| student_id       | FK         | Link to Student                    |
| amount_mad       | Double     | Payment amount                     |
| due_date         | Date       | Payment due date                   |
| payment_date     | Date       | Filled when paid                   |
| method           | Enum       | CASH / CIH / ATTIJARI / etc.       |
| status           | Enum       | PAID / PENDING                     |
| notes            | String     | Optional notes                     |
| created_at       | DateTime   | Record creation time               |

---

## Enums

### StudentStatus
- ACTIVE
- ON_HOLD
- DROPPED

### Schedule
- MORNING
- EVENING
- NIGHT

---

## Computed Logic (Not Stored in DB)

### Overdue Payment
A payment is **overdue** if:
- status = PENDING
- AND due_date < today

### Days Late
- days_late = today - due_date

### Class Enrollment Count
- number of students linked to the class

---
