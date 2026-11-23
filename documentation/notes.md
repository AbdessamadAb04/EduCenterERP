
## Guidance

- - - - -
mkdir "src\main\java\com\educentererp\module\student"
mkdir "src\main\java\com\educentererp\module\classe"
mkdir "src\main\java\com\educentererp\module\finance"
mkdir "src\main\java\com\educentererp\module\dashboard"
mkdir "src\main\java\com\educentererp\config"
- - - - -

Student.java — the entity (database table)
StudentRepository.java — talks to the database
StudentService.java — the business logic
StudentController.java — the API endpoints

- How everything work together

Client (React / Frontend)
↓
Controller
↓
DTO (input)
↓
Mapper → Entity
↓
Service
↓
> Repository (DB) 
↓
Entity
↓
Mapper → DTO (output)
↓
Controller → Client


## Modules

- Module 1 : Dashboard Général

This is a read-only summary screen. It pulls data from modules 2 and 4 and displays it cleanly. No actions happen here except navigation.
It shows 4 metric cards at the top: total active students, total revenue this month (MAD), number of pending payments, and number of overdue payments. Below that, two small lists side by side: recent enrollments (last 5) and overdue payments (top 5 by days late).

- Module 2 : Étudiants 

A student has: full name, phone number, language, level (A1 through C2), assigned class (linked to module 3), enrollment date, and status (active / on hold / dropped).
Actions: add student, edit student, view profile, filter by status / language / level. The profile page shows the student's assigned class and their full payment history.

- Module 3 : Classes 

A class has: name (e.g. "English B2 Morning"), language, level, schedule (morning / evening / weekend), assigned teacher (just a text field for now), max capacity, and current enrollment count.
Actions: create class, edit class, view class roster (list of students in it), archive a class when it ends.
The class roster page is the natural bridge between this module and the students module — you click a class, you see who's in it, and each name links to the student profile.
One thing to be careful about: don't over-engineer the scheduling here. No timetable, no calendar, no hour-by-hour planning for the initial version product. A class is just a named group with a time slot label. That's enough for a first demo.

- Module 4 : Finance & Paiements (le plus urgent pour ROI)

A payment record has: student (linked), amount in MAD, due date, payment date (if paid), method (cash/CIH transfer/Attijari/other), and status (paid/pending/overdue).
Overdue is automatically calculated — if the due date has passed and status is still pending, it becomes overdue.
Actions: record a payment, mark as paid, view all payments filtered by status, see per-student payment history.
One critical feature: a simple overdue list sorted by days late, with a manual "send reminder" button that for now just copies a WhatsApp message template. Directors in Morocco communicate via WhatsApp — this alone will impress them.


## Ideas:

The core entity: Payment
Every payment record contains exactly these fields: student (foreign key), amount in MAD, due date, payment date (nullable — empty if not yet paid), payment method (enum: cash, CIH, Attijari, virement, other), status (enum: paid, pending, overdue), and notes (optional free text field for the admin to add context).
How status works
Pending is the default when a payment is created. Paid is set manually by the admin when they click "mark as paid" and enter the payment date and method. Overdue is never set manually — it is calculated automatically on the fly: if status is pending AND due date is before today, display it as overdue. No cron job, no background task. Just a condition in your query.
What the admin can do
Create a payment record for a student, specifying amount and due date. Mark a payment as paid, which records today's date and asks for the payment method. Edit a payment record. Delete a payment record. View the full payment list filtered by status (all / paid / pending / overdue). View a specific student's payment history from their profile page.
The overdue list
This is its own dedicated view, sorted by days late descending (most overdue at the top). Each row shows the student name, amount, due date, days late, and a WhatsApp button. The WhatsApp button opens wa.me/212XXXXXXXXX with a pre-filled message in French or Darija, something like "Bonjour, nous vous rappelons que votre paiement de X MAD était dû le [date]. Merci de régulariser votre situation." The phone number comes from the student record — which is why clean phone formatting in module 2 matters.
Dashboard numbers this feeds
Total revenue this month = sum of all payments where status is paid AND payment date is in current month. Pending count = payments where status is pending and due date is in the future. Overdue count = payments where status is pending and due date is past.
