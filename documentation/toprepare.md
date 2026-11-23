# EduCenterERP — À préparer pour l'examen backend

Objectif de cette fiche : réviser rapidement ce que fait chaque Jalon, ce qu'il faut savoir expliquer, et comment le tester avec Postman.

> Le frontend est volontairement ignoré. L'examen porte sur le backend Spring Boot, les microservices, et Postman.

---

## 1. Vue globale du projet

### Domaine métier
EduCenterERP gère un centre de langues :

- **établissements** : centres, villes, coordonnées ;
- **utilisateurs** : owner/admin/etc. rattachés à un établissement ;
- **classes** : groupes de cours liés à un établissement ;
- **étudiants** : inscrits dans une classe ;
- **sessions** : séances hebdomadaires d'une classe ;
- **paiements** : liés à un étudiant, une classe, un établissement ;
- **dashboard** : indicateurs calculés à partir des étudiants et paiements.

### Architecture actuelle

| Application | Port | Rôle |
|---|---:|---|
| `api-gateway` | 8080 | Point d'entrée HTTP unique, routes `lb://...`, CORS centralisé |
| `config-server` | 8888 | Configuration centralisée, fichiers YAML par service |
| `eureka-server` | 8761 | Registre des services |
| `etablissement-service` | 8081 | Users, établissements, appartenances |
| `formation-service` | 8082 | Classes, étudiants, sessions |
| `finance-service` | 8083 | Paiements, dashboard |
| `notification-service` | 8084 | Prévu plus tard (Jalon 05), pas implémenté maintenant |

Base de données : **H2**, une base par service métier.

Versions : Spring Boot **3.5.13**, Spring Cloud **2025.0.1**. Le `pom.xml` déclare Java 17 ; les vérifications locales ont été faites avec JDK 25.

### Dépendances métier entre services

```text
finance-service  --Feign--> formation-service      (valider étudiant/classe)
finance-service  --Feign--> etablissement-service  (résoudre le libellé établissement)
formation-service --Feign--> etablissement-service (valider établissement)
formation-service --Feign--> finance-service       (compter paiements avant suppression étudiant)
```

Ce ne sont pas des jointures JPA : ce sont des appels HTTP via OpenFeign + Eureka.

---

## 2. Jalon 00 — Cadrage du projet

### À savoir expliquer
Avant de coder, il faut définir :

- les **frontières métier** : quels objets appartiennent à quel service ;
- le **diagramme de classes UML** avec dépendances en pointillés `-->` entre services ;
- le **diagramme d'architecture** avec noms d'applications et ports ;
- la roadmap Jalons 00 → 06.

### Livrables
- `README.md` ;
- diagrammes Mermaid ;
- `documentation/googledrivetps.md`.

### À retenir
Jalon 00 = **cadrage et documentation**, pas encore de changement Java métier.

---

## 3. Jalon 01 — Services métier indépendants

### Objectif
Découper l'ancien backend monolithique en **services Spring Boot séparés**, chacun avec sa propre base H2.

### Ce qui a été fait
- `educenter-backend/pom.xml` est devenu un **POM parent** avec modules :
  - `common`
  - `etablissement-service`
  - `formation-service`
  - `finance-service`
  - plus tard : `config-server`, `eureka-server`, `api-gateway`
- Chaque service a :
  - `Controller` → `Service` → `Repository` → `Entity` ;
  - sa propre base H2 ;
  - ses propres DTOs et validation ;
  - ses propres tests de contexte Spring.
- Les relations inter-services sont devenues des **IDs** (`etablissement_id`, `classe_id`, `student_id`) au lieu de jointures JPA entre services.
- Un gateway statique temporaire permettait au frontend de rester sur `:8080`.

### Concepts à maîtriser
- Spring Boot 3, Maven multi-modules.
- REST : `GET`, `POST`, `PUT`, `DELETE`.
- Codes HTTP : `200`, `201`, `204`, `400`, `404`, `500`.
- Validation Jakarta : `@NotBlank`, `@NotNull`, `@Valid`.
- DTO `record` Java, sérialisation JSON en `snake_case`.
- H2 en mémoire pour les tests, fichier pour le runtime.
- `@RestController`, `@RequestMapping`, `@PathVariable`, `@RequestParam`, `@RequestBody`.
- `@Entity`, `@Repository`, `@Service`, `@RequiredArgsConstructor`.

### Endpoints principaux

#### `etablissement-service` :8081
- `GET /api/users/me?email=...`
- `GET /api/users/{id}`
- `POST /api/users`
- `PUT /api/users/{id}`
- `GET /api/users/{id}/etablissements`
- `GET /api/etablissements`
- `GET /api/etablissements/{id}`
- `POST /api/etablissements`
- `PUT /api/etablissements/{id}`

#### `formation-service` :8082
- `GET /api/classes`, `GET /api/classes/{id}`, `POST /api/classes`, `PUT /api/classes/{id}`, `DELETE /api/classes/{id}`
- `GET /api/students`, `GET /api/students/{id}`, `POST /api/students`, `PUT /api/students/{id}`, `DELETE /api/students/{id}`
- `GET /api/students/classe/{classeId}`
- `GET /api/sessions`, `GET /api/sessions/{id}`, `POST /api/sessions`, `POST /api/sessions/classes/{classId}`
- `PUT /api/sessions/{id}`, `PUT /api/sessions/{id}/archive`, `PUT /api/sessions/{id}/restore`
- `DELETE /api/sessions/{id}`, `DELETE /api/sessions/classes/{classId}`

#### `finance-service` :8083
- `GET /api/payments`, `GET /api/payments/{id}`, `POST /api/payments`
- `GET /api/payments/count?student_id=...`
- `PUT /api/payments/{id}`, `PUT /api/payments/{id}/pay`, `PUT /api/payments/{id}/archive`
- `DELETE /api/payments/{id}`
- `GET /api/payments/{id}/receipt`
- `GET /api/dashboard`

### Question probable
**Pourquoi chaque service a sa propre base ?**  
Pour être indépendant : pas de jointure跨-service, déploiement séparé, schéma propre, et pannes isolées.

---

## 4. Jalon 02 — Eureka et Gateway

### Objectif
Supprimer les URLs codées en dur et exposer une seule URL publique.

### Ce qui a été fait
- Ajout de `eureka-server` sur `:8761`.
- Tous les services s'enregistrent dans Eureka.
- Le gateway remplace les routes statiques par des routes dynamiques :
  - `lb://ETABLISSEMENT-SERVICE`
  - `lb://FORMATION-SERVICE`
  - `lb://FINANCE-SERVICE`
- CORS est configuré **une seule fois** dans le gateway.
- Le frontend continue d'appeler `http://localhost:8080`.

### Concepts à maîtriser
- Service discovery : les services s'enregistrent et se découvrent par nom logique.
- `lb://NOM_DU_SERVICE` = load-balanced URI via Eureka + Spring Cloud LoadBalancer.
- Actuator : endpoints de santé et d'administration.
- Gateway = reverse proxy applicatif : route, filtre, CORS.
- `spring.application.name` doit correspondre au nom Eureka.

### Routes à connaître
| Chemin | Service cible |
|---|---|
| `/api/etablissements/**`, `/api/users/**` | `lb://ETABLISSEMENT-SERVICE` |
| `/api/classes/**`, `/api/students/**`, `/api/sessions/**` | `lb://FORMATION-SERVICE` |
| `/api/payments/**`, `/api/dashboard/**` | `lb://FINANCE-SERVICE` |

### URLs de vérification
- `http://localhost:8761/` : dashboard Eureka
- `http://localhost:8080/actuator/health`
- `http://localhost:8080/actuator/gateway/routes`
- `http://localhost:8761/eureka/apps`

### Question probable
**Que se passe-t-il si Eureka est arrêté ?**  
Les nouvelles instances ne peuvent plus s'enregistrer et le gateway ne peut plus résoudre les `lb://...`. Les services déjà démarrés peuvent encore fonctionner localement, mais le routage dynamique est dégradé.

---

## 5. Jalon 03 — Config Server

### Objectif
Externaliser la configuration pour éviter de reconstruire les applications lors d'un changement de port, de base, d'URL, etc.

### Ce qui a été fait
- Ajout de `config-server` sur `:8888`.
- Configuration `native` : fichiers dans `config-server/src/main/resources/config/` :
  - `application.yml`
  - `api-gateway.yml`
  - `eureka-server.yml`
  - `etablissement-service.yml`
  - `formation-service.yml`
  - `finance-service.yml`
- Chaque service importe :
  - `spring.config.import=optional:configserver:http://localhost:8888`
- Si Config Server est indisponible, les valeurs locales de `application.properties` servent de fallback.

### Concepts à maîtriser
- Configuration centralisée vs configuration embarquée.
- Spring Cloud Config Server.
- `spring.cloud.config.name` = nom du fichier YAML à récupérer.
- `optional:` = le service démarre même si le Config Server est down.
- Ordre de démarrage : **Config Server d'abord**, puis Eureka, puis métiers, puis Gateway.

### URLs de vérification
- `http://localhost:8888/actuator/health`
- `http://localhost:8888/api-gateway/default`
- `http://localhost:8888/etablissement-service/default`
- `http://localhost:8888/finance-service/default`
- `http://localhost:8888/formation-service/default`

### Question probable
**Pourquoi `optional:` ?**  
Pour permettre aux services de démarrer en local même si le Config Server n'est pas lancé. Les propriétés locales prennent le relais.

---

## 6. Jalon 04 — Communication synchrone, idempotence, erreurs

### Objectif officiel
Mettre en place la communication synchrone entre microservices :

1. valider les données externes avant une création ;
2. calculer et enregistrer les données métier avec une clé d'idempotence ;
3. retourner une vue enrichie combinant plusieurs services ;
4. gérer refus métier, ressources introuvables et erreurs de communication.

### 6.1 OpenFeign

Feign permet d'appeler un autre microservice comme s'il s'agissait d'une méthode Java.

Exemple : `finance-service` appelle `formation-service` pour vérifier qu'un étudiant existe avant de créer un paiement.

Clients principaux :

| Service | Client Feign | Cible |
|---|---|---|
| finance | `StudentFeignClient` / `StudentClient` | formation |
| finance | `ClassFeignClient` / `ClassClient` | formation |
| finance | `EtablissementFeignClient` / `EtablissementClient` | établissement |
| formation | `EtablissementFeignClient` / `EtablissementClient` | établissement |
| formation | `PaymentFeignClient` / `PaymentClient` | finance |

Points importants :
- `@EnableFeignClients(basePackages = "com.educentererp")` dans finance et formation.
- Chaque `@FeignClient` a un `contextId` unique pour éviter les conflits de beans.
- Les wrappers traduisent les erreurs :
  - `FeignException.NotFound` → `NoSuchElementException` → **404**
  - autres `FeignException` → `RemoteServiceException` → **502**

### 6.2 Validation externe avant création

| Action | Validation Feign |
|---|---|
| `POST /api/classes` | vérifie que `etablissement_id` existe |
| `POST /api/students` | vérifie la classe et son établissement |
| `POST /api/payments` | vérifie l'étudiant, la classe, puis l'établissement |
| `DELETE /api/students/{id}` | demande à finance le nombre de paiements ; refus si l'étudiant a des paiements |

### 6.3 Idempotence

Une clé d'idempotence évite les doublons lorsqu'un client réessaie la même requête.

Header :

```http
Idempotency-Key: jalon04-demo
```

Endpoints concernés :

- `POST /api/payments`
- `POST /api/classes`
- `POST /api/students`
- `POST /api/sessions`
- `POST /api/sessions/classes/{classId}`

Fonctionnement :

| Cas | Résultat |
|---|---|
| Première requête avec clé | Création + stockage de la réponse dans `idempotency_keys` |
| Même clé + même corps | Rejeu de la réponse stockée, aucun doublon |
| Même clé + corps différent | **409 Conflict** |
| Pas de clé | Comportement normal, création possible |

Techniquement :
- table `idempotency_keys` dans finance et formation ;
- hash SHA-256 du corps JSON ;
- réponse stockée en JSON ;
- `IllegalStateException` → **409** via `ApiExceptionHandler`.

### 6.4 Vue enrichie

`PaymentResponse` contient maintenant des informations provenant de plusieurs services :

- données du paiement : `id`, `amount`, `due_date`, `method`, `status` ;
- données formation : `student`, `phone`, `class` ;
- données établissement : `etablissement_id`, `etablissement_name`.

Exemple de réponse attendue :

```json
{
  "id": "5",
  "student_id": "1",
  "class": "Français - FLE Débutant",
  "student": "Amine Berrada",
  "amount": 480.0,
  "etablissement_id": "1",
  "etablissement_name": "Casablanca Language & Training Center"
}
```

### 6.5 Gestion des erreurs

| Situation | Code | Origine |
|---|---:|---|
| Validation locale échoue | 400 | `@Valid` / `MethodArgumentNotValidException` |
| Refus métier, ex. suppression étudiant avec paiements | 400 | `IllegalArgumentException` |
| Ressource locale introuvable | 404 | `NoSuchElementException` |
| Ressource externe introuvable | 404 | Feign `NotFound` → `NoSuchElementException` |
| Clé d'idempotence réutilisée avec un autre corps | 409 | `IllegalStateException` |
| Service distant indisponible | 502 | `RemoteServiceException` |
| Erreur non prévue | 500 | `Exception` générique |

Classe centrale : `common/src/main/java/com/educentererp/common/ApiExceptionHandler.java`.

### Question probable
**Différence entre 404 et 502 ?**  
404 = la ressource demandée n'existe pas. 502 = le service qui devrait répondre est indisponible ou a échoué lors de la communication.

---

## 7. Postman — Ce qu'il faut savoir tester

Collection : `documentation/postman/EduCenterERP.postman_collection.json`

Variables importantes :

| Variable | Valeur par défaut |
|---|---|
| `baseUrl` | `http://localhost:8080` |
| `configUrl` | `http://localhost:8888` |
| `eurekaUrl` | `http://localhost:8761` |
| `etablissementId` | `1` |
| `classeId` | `1` |
| `studentId` | `1` |
| `paymentId` | `1` |
| `idempotencyKey` | `jalon04-demo` |

### Ordre de lancement des services

```powershell
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-25.0.4.101-hotspot"
cd educenter-backend
.\mvnw.cmd clean install
```

Puis dans des terminaux séparés, depuis `educenter-backend/` :

```powershell
.\mvnw.cmd -pl config-server spring-boot:run
.\mvnw.cmd -pl eureka-server spring-boot:run
.\mvnw.cmd -pl etablissement-service spring-boot:run
.\mvnw.cmd -pl formation-service spring-boot:run
.\mvnw.cmd -pl finance-service spring-boot:run
.\mvnw.cmd -pl api-gateway spring-boot:run
```

### Folders de la collection

#### 1. Configuration
- `GET {{configUrl}}/actuator/health` → `UP`
- `GET {{configUrl}}/api-gateway/default`
- `GET {{configUrl}}/etablissement-service/default`

#### 2. Discovery
- `GET {{eurekaUrl}}/eureka/apps`
- `GET {{baseUrl}}/actuator/health`
- `GET {{baseUrl}}/actuator/gateway/routes`

#### 3. Smoke
- `GET /api/users/me`
- `GET /api/etablissements`
- `GET /api/classes`
- `GET /api/students`
- `GET /api/sessions`
- `GET /api/payments`
- `GET /api/payments/count`
- `GET /api/dashboard`
- `GET /api/payments/{id}/receipt`

#### 4. Writes
- `POST /api/classes`
- `POST /api/students`
- `POST /api/payments`
- `DELETE /api/students/{id}` avec paiements → refus métier **400**

#### 5. Idempotency & Feign validation
- `POST /api/classes` avec `Idempotency-Key`
- rejeu du même `POST /api/classes` → même `id`, aucun doublon
- `POST /api/payments` avec `Idempotency-Key`
- rejeu du même `POST /api/payments` → même `id`, aucun doublon
- `POST /api/classes` avec `etablissement_id=999999` → **404**
- `POST /api/payments` avec `student_id=999999` → **404**
- rejeu avec la même clé mais un autre `amount` → **409**
- scénario manuel 502 : arrêter `formation-service`, puis envoyer `POST /api/payments`

### Scénario 502 en exam
1. Démarre tous les services.
2. Vérifie que `POST /api/payments` fonctionne.
3. Arrête `formation-service`.
4. Renvoie `POST /api/payments`.
5. Réponse attendue :

```json
{"error":"Formation service indisponible"}
```

Code HTTP : **502 Bad Gateway**.

---

## 8. Bagage général à avoir

### Spring Boot
- Cyclone MVC : Controller → Service → Repository.
- Injection de dépendances avec constructeur via Lombok `@RequiredArgsConstructor`.
- Annotations : `@RestController`, `@Service`, `@Repository`, `@Entity`, `@Transactional` (à connaître même si non utilisé partout).
- `@Value` pour lire une propriété.
- Actuator pour health et infos.

### HTTP / REST
- GET = lire, POST = créer, PUT = modifier, DELETE = supprimer.
- Idempotence HTTP : GET/PUT/DELETE sont idéalement idempotents, POST ne l'est pas naturellement.
- Différence entre 400, 404, 409, 500, 502.
- Header HTTP : `Content-Type`, `Idempotency-Key`, `Origin`.

### JSON
- `snake_case` dans les DTOs : `student_id`, `etablissement_id`, `due_date`.
- Les IDs sont souvent des `String` côté DTO, puis parsés en `Long` côté service.
- Jackson convertit JSON ↔ objets Java.

### Maven
Commandes utiles :

```powershell
.\mvnw.cmd clean install
.\mvnw.cmd -q -DskipTests -pl common,finance-service,formation-service -am compile
.\mvnw.cmd -pl finance-service,formation-service -am test "-Dtest=*ApplicationTests" "-Dsurefire.failIfNoSpecifiedTests=false"
```

À savoir :
- `-pl` = module ciblé ;
- `-am` = construit aussi les modules dépendants ;
- `-DskipTests` = compile sans exécuter les tests ;
- `-q` = mode silencieux.

### H2
- Base locale par service.
- `jdbc:h2:file:./data/finance`, `./data/formation`, `./data/etablissement`.
- H2 console activée sur chaque service métier (`/h2-console`).

### OpenAPI / Swagger
- Swagger UI :
  - `http://localhost:8081/swagger-ui.html`
  - `http://localhost:8082/swagger-ui.html`
  - `http://localhost:8083/swagger-ui.html`
- Sert à voir et tester les endpoints directement par service.

### Git / état actuel
- Tags locaux : `v0.0`, `v0.1`, `v1.0`, `v2.0`, `v3.0`.
- Jalon 04 est implémenté dans le worktree mais **pas encore commité**, pas de tag `v4.0`.
- Rien n'a été pushé.

---

## 9. Limites connues à connaître

À citer si l'examinateur demande ce qui pourrait être amélioré :

1. **Idempotency race** : `replay()` et `store()` ne sont pas dans une transaction atomique ; deux requêtes concurrentes avec la même clé peuvent créer un doublon.
2. **Pas de timeout Feign explicite** dans les fichiers de config locale/fallback.
3. **Pas de tests Jalon 04 dédiés** : seulement des tests de chargement de contexte Spring.
4. **Reçu PDF** : dépend de Python + `reportlab`, et le chemin du script peut poser problème selon le dossier de lancement.
5. **Pas de notification Jalon 05** : RabbitMQ/Mailpit ne font pas encore partie de la version actuelle.

---

## 10. Checklist finale à réciter

- Je sais nommer les 7 modules Maven et leurs ports.
- Je sais expliquer pourquoi chaque service métier a sa base H2.
- Je sais expliquer Eureka et pourquoi le gateway utilise `lb://`.
- Je sais expliquer Config Server, `optional:configserver`, et le fallback local.
- Je sais expliquer un appel Feign et la traduction 404 / 502.
- Je sais expliquer l'idempotence : même clé + même corps = rejeu ; même clé + autre corps = 409.
- Je sais montrer la vue enrichie d'un paiement.
- Je sais lancer les services dans le bon ordre.
- Je sais quoi vérifier dans Postman : config, discovery, smoke, writes, idempotence, 404, 409, 502.
- Je sais que le frontend est hors sujet.






#### POSTMAN

Voici les 5 dossiers de la collection et quoi dire à ton encadrant :
done


1. Configuration
Rôle : vérifier que le Config Server fonctionne et fournit les configurations.
Requêtes : Config server health, Gateway config, Etablissement config.
Phrase à dire :
“Je vérifie que Config Server est UP et que le Gateway et les services récupèrent bien leur configuration.”
done


2. Discovery
Rôle : vérifier qu’Eureka connaît les services et que le Gateway route vers eux.
Requêtes : Eureka applications, Gateway actuator health, Gateway actuator routes.
Phrase à dire :
“Je vérifie que les services sont enregistrés dans Eureka et que le Gateway utilise les routes lb://.”
done


3. Smoke
Rôle : vérifier rapidement que toutes les lectures fonctionnent.
Requêtes : List etablissements, List classes, List students, List sessions, List payments, Get dashboard.
Phrase à dire :
“Je fais un test rapide des GET pour confirmer que le backend répond via le Gateway.”
done


4. Writes
Rôle : vérifier les créations, modifications et refus métier.
Requêtes : Create class, Create student, Create payment, Delete student with payments.
Phrase à dire :
“Je teste les POST et je vérifie aussi qu’on refuse de supprimer un étudiant avec des paiements, avec un 400.”
done


5. Idempotency & Feign validation
Rôle : vérifier tout le Jalon 04.
Tu montres :
- même clé + même corps → même résultat, pas de doublon ;
- même clé + autre corps → 409 ;
- ID inexistant → 404 ;
- service distant arrêté → 502 ;
- paiement enrichi avec etablissement_id et etablissement_name.
Phrase à dire :
“Je vérifie l’idempotence, la validation Feign et la gestion des erreurs 404, 409 et 502.”
