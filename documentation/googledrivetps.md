# Google Drive TPs — Jalon objectives

Source: `documentation/drivelink.md`.

Target map used below:

```text
React frontend --:8080--> API Gateway
                         |-- eureka-server         :8761
                         |-- config-server         :8888
                         |-- etablissement-service :8081  users, établissements
                         |-- formation-service     :8082  classes, sessions, étudiants
                         |-- finance-service       :8083  payments, dashboard
                         `-- notification-service  :8084  RabbitMQ -> Mailpit
```

## Jalon 00 — Frame the project

**Practice behind it:** define the business boundaries and the runtime map before writing microservices.

**Functionalities / deliverables:** short project README, UML class diagram of the business classes with dashed dependency arrows (`-->`), architecture diagram with application names and ports.

**Implementation / consequence in EduCenterERP:** create the missing root `README.md`. Describe center management (students, classes, sessions, payments). The brief mentions 5 apps; the diagram also shows Config Server and Notification Service because they are introduced later. No Java change.

---

## Jalon 01 — Independent business services

**Practice behind it:** break the current monolith into separately runnable Spring Boot services with clean layers and validated inputs.

**Functionalities / deliverables:** REST CRUD for users/établissements, classes/sessions/étudiants, payments/dashboard; DTO validation; correct HTTP codes; error handling; Postman/Swagger tests; tag `v1.0`.

**Implementation / consequence in EduCenterERP:** turn `educenter-backend/pom.xml` into a parent POM, move existing modules into the 3 business services, give each its own H2 database. Cross-service objects become IDs, not JPA joins. A temporary static gateway keeps the frontend on `:8080`.

---

## Jalon 02 — Discovery and single entrypoint

**Practice behind it:** remove hardcoded service URLs and expose one stable API URL.

**Functionalities / deliverables:** Eureka registry, gateway dynamic routing with `lb://`, updated architecture diagram.

**Implementation / consequence in EduCenterERP:** add `eureka-server` on `:8761`, register all services, replace the temporary gateway routes with discovery-based routes. The frontend does not change. CORS is handled once at the gateway.

---

## Jalon 03 — Centralized configuration

**Practice behind it:** externalize settings so services can be reconfigured without rebuilding.

**Functionalities / deliverables:** Config Server on `:8888`, one YAML file per service.

**Implementation / consequence in EduCenterERP:** move ports, H2 URLs, Eureka, Feign timeouts, RabbitMQ and Mailpit settings into `config-server/src/main/resources/config/`. Each service imports them with a local fallback. Startup order becomes Config Server first.

---

## Jalon 04 — Synchronous calls and idempotency

**Practice behind it:** compose services over HTTP while preventing duplicates when calls are retried.

**Functionalities / deliverables:** Feign validation calls, enriched multi-service responses, `Idempotency-Key`, explicit 404 / 409 / 502 handling.

**Implementation / consequence in EduCenterERP:** `finance → formation` validates student/class before payment; `formation → établissement` validates the établissement. Payments keep denormalized student/class/établissement labels already present in `PaymentResponse`. An `idempotency_keys` table per writer service makes POST replay safe. Consequence: no duplicate payment on retry and clearer failure responses.

---

## Jalon 05 — Asynchronous notification

**Practice behind it:** decouple a business commit from side effects such as sending email.

**Functionalities / deliverables:** RabbitMQ JSON event, Mailpit SMTP, email after a business operation, delayed processing when the consumer is down.

**Implementation / consequence in EduCenterERP:** add `docker-compose.yml` for RabbitMQ and Mailpit. `notification-service` consumes a `NotificationEmailRequestedEvent`; `finance-service` publishes it after transaction commit without waiting for the email. Consequence: payment creation stays fast, email retries do not roll back payment, README gains Docker commands and the queue/SMTP diagram.

---

## Jalon 06 — Resilience

**Practice behind it:** make synchronous dependencies fail gracefully in realistic network conditions.

**Functionalities / deliverables:** Circuit Breaker + Retry + timeouts on at least two Feign calls, centralized `@RestControllerAdvice`, demo of normal / unavailable / replay scenarios.

**Implementation / consequence in EduCenterERP:** apply Resilience4j to `finance → formation` and `formation → établissement`, keep timeouts in Config Server, map remote outages to 502/503, and replay with the same idempotency key. Consequence: one failing service does not cascade; Caffeine is optional and skipped for now.

---

## Jalon 07 — Kafka migration (out of scope)

**Practice behind it:** replace a message broker with an event-streaming platform.

**Functionalities / deliverables:** Kafka topics, producers, consumers, partitions.

**Implementation / consequence in EduCenterERP:** none now. It is only recorded as a future evolution; the current RabbitMQ JSON event contract is kept reusable.
