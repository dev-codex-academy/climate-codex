# CRM API Documentation

This API enables management of Clients, Services, Leads, Pipelines, and Enrollments within the CRM.

## Authentication
Token Authentication is required for all requests.

**Header**: `Authorization: Token <your_token>`

### Obtain Token
**POST** `/api-token-auth/`
```json
{
    "username": "your_username",
    "password": "your_password"
}
```
**Response:**
```json
{ "token": "<your_token>" }
```

### Get User Context
**GET** `/api/me/`
Returns current user permissions and group membership.
```json
{
    "id": 1,
    "username": "user.name",
    "groups": ["Sales"],
    "permissions": ["app.add_lead", "app.view_client"]
}
```

---

## 1. Attributes (Dynamic Schema)
**CRITICAL:** Attributes define the schema for Clients, Services, and Leads. They must be created first.

### List Attributes
**GET** `/api/attributes/<entity_name>/`
*(entity_name: client, service, lead, follow_up)*

**Response:**
```json
[
    {
        "id": "uuid",
        "name": "industry",
        "label": "Industry",
        "type": "text",
        "is_required": true
    }
]
```

### Create Attribute
**POST** `/api/attributes/<entity_name>/`

**Payload:**
```json
{
    "name": "industry",
    "label": "Industry Sector",
    "type": "text",   // Options: text, number, date, boolean, list, file
    "is_required": true,
    "list_values": ["Tech", "Health"] // Optional
}
```

### Update Attribute
**PUT/PATCH** `/api/attributes/<attribute_uuid>/`

**Payload:**
```json
{
    "label": "Industry Group",
    "is_required": false
}
```

### Delete Attribute
**DELETE** `/api/attributes/<attribute_uuid>/`

---

## 2. Clients

### List Clients
**GET** `/api/clients/`
*Query Params: ?name=Acme*

### Create Client
**POST** `/api/clients/`

**Payload:**
```json
{
    "name": "Acme Corp",
    "attributes": {
        "industry": "Tech",
        "custom_field": "value"
    },
    "list_of_tasks": [],
    "list_of_notes": []
}
```

### Manage Client Tasks and Notes
You can add tasks and notes to a client by including them in the `list_of_tasks` or `list_of_notes` arrays.
**Note:** The system uses `UUIDs` to uniquely identify each task and note. If you add a task or note without an `id`, the system will automatically generate a UUID for it.


**Task Structure:**
```json
{
    "task": "Call client",
    "date": "2025-01-20",
    "completed": false,
    "user_id": 1,                         // Output Only
    "user_name": "John Doe"               // Output Only
}
```

**Note Structure:**
```json
{
    "note": "Client requested new proposal",
    "user_id": 1,                         // Output Only
    "user_name": "John Doe"               // Output Only
}
```

**Example - Add Task and Note (PATCH):**
```json
{
    "list_of_tasks": [
        { "task": "New Task", "date": "2026-01-01", "completed": false }
    ],
    "list_of_notes": [
        { "note": "Spoke with CEO", "user_id": 1 }
    ]
}
```

### Retrieve Client
**GET** `/api/clients/<uuid>/`

### Update Client
**PUT** `/api/clients/<uuid>/`

**Payload:**
```json
{
    "name": "Acme Inc",
    "attributes": {
    "attributes": {
        "industry": "Finance"
    }
}
```

### Client Atomic Updates
Avoid race conditions by using these atomic endpoints instead of updating the full lists.

#### Update Task Status
**POST** `/api/clients/<uuid>/update-task/`
```json
{
    "task_id": "uuid-of-task",
    "completed": true
}
```

#### Delete Note
**POST** `/api/clients/<uuid>/delete-note/`
```json
{
    "id": "uuid-of-note"
}
```

### Partial Update Client
**PATCH** `/api/clients/<uuid>/`

**Payload:**
```json
{
    "name": "Acme International"
}
```

### Delete Client
**DELETE** `/api/clients/<uuid>/`

#### Client Fields Reference
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique identifier (Auto-generated) |
| `name` | String | Name of the client/company (Max 255 chars) |
| `attributes` | JSONB | Dynamic key-value attributes (e.g., industry, source) |
| `list_of_tasks` | JSONB | List of tasks `{task, date, completed, date_created, user_id (Output Only), user_name (Output Only)}` |
| `list_of_notes` | JSONB | List of notes `{date, note, user_id (Output Only), user_name (Output Only)}` |
| `list_of_images` | JSONB | List of image URLs |
| `created_at` | DateTime | Timestamp of creation |
| `created_by` | User | User who created the record |

---

## 3. Services (Students)

### List Services
**GET** `/api/services/`
*Query Params: ?client=<uuid>*

### Create Service
**POST** `/api/services/`

**Payload:**
```json
{
    "name": "Jane Doe",
    "client": "<client_uuid>",
    "attributes": {
        "program": "Full Stack"
    },
    "list_of_tasks": [],
    "list_of_notes": []
}
```

### Manage Service Tasks and Notes
Similar to Clients and Leads, Services support task and note management.
**Note:** The system uses `UUIDs` to uniquely identify each task and note. If you add a task or note without an `id`, the system will automatically generate a UUID for it.

**Example - Add Task and Note (PATCH):**
```json
{
    "list_of_tasks": [
        { "task": "Prepare Materials", "date": "2026-02-01", "completed": false }
    ],
    "list_of_notes": [
        { "note": "Student requested delay", "user_id": 1 }
    ]
}
```

### Service Atomic Updates

#### Update Task Status
**POST** `/api/services/<uuid>/update-task/`
```json
{
    "task_id": "uuid-of-task",
    "completed": true
}
```

#### Delete Note
**POST** `/api/services/<uuid>/delete-note/`
```json
{
    "id": "uuid-of-note"
}
```

### Retrieve Service
**GET** `/api/services/<uuid>/`

### Update Service
**PUT** `/api/services/<uuid>/`

**Payload:**
```json
{
    "name": "Jane Doe Smith",
    "client": "<client_uuid>",
    "attributes": {
        "program": "Data Science"
    }
}
```

### Delete Service
**DELETE** `/api/services/<uuid>/`

#### Service Fields Reference
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique identifier (Auto-generated) |
| `name` | String | Name of the student/service |
| `client` | ForeignKey | UUID of the associated Client |
| `actual_cohort` | ForeignKey | Current active Cohort |
| `origin_cohort` | UUID (FK) | Original cohort assigned to the service |
| `attributes` | JSONB | Dynamic key-value attributes |
| `list_of_tasks` | JSONB | List of tasks `{task, date, completed, date_created, user_id (Output Only), user_name (Output Only)}` |
| `list_of_notes` | JSONB | List of notes `{date, note, user_id (Output Only), user_name (Output Only)}` |
| `list_of_images` | JSONB | List of image URLs |
| `created_at` | DateTime | Timestamp of creation |

---

## 4. Pipelines

### List Pipelines
**GET** `/api/pipelines/`

### Create Pipeline
**POST** `/api/pipelines/`

**Payload:**
```json
{
    "name": "B2B Sales",
    "description": "Main sales process",
    "stages": [
        {"name": "Prospecting", "color": "#6c6f73", "order": 1},
        {"name": "Negotiation", "color": "#007bff", "order": 2}
    ]
}
```

### Retrieve Pipeline
**GET** `/api/pipelines/<uuid>/`

### Update Pipeline
**PUT** `/api/pipelines/<uuid>/`

**Payload:**
```json
{
    "name": "B2B Sales V2",
    "stages": [
        {"name": "Qualification", "color": "#6c6f73", "order": 1},
        {"name": "Closed", "color": "#28a745", "order": 2}
    ]
}
```

### Delete Pipeline
**DELETE** `/api/pipelines/<uuid>/`

#### Pipeline Fields Reference
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique identifier |
| `name` | String | Name of the pipeline |
| `description` | Text | Optional description |
| `stages` | JSONB | List of stages. Each stage has `id`, `name`, `color`, `order`. |

---

## 5. Leads

### List Leads
**GET** `/api/leads/`
*Query Params: ?responsible=<user_id>&stage=Prospecting*

### Create Lead
**POST** `/api/leads/`

**Payload:**
```json
{
    "name": "Potential Student",
    "responsible": 1,
    "pipeline": "<pipeline_id_optional>",
    "stage": "Prospecting",
    "attributes": {
        "source": "LinkedIn"
    },
    "list_of_tasks": [
        {
            "task": "Initial call",
            "date": "2025-01-20",
            "completed": false
        }
    ]
}
```

### Manage Lead Tasks
You can add tasks to a lead by including them in the `list_of_tasks` array.
The system automatically adds a `date_created` timestamp to new tasks if it's missing.
**Note:** The system uses `UUIDs` to uniquely identify each task and note. If you add a task or note without an `id`, the system will automatically generate a UUID for it.

**Task Structure:**
```json
{
    "task": "Description of the task",    // Required
    "date": "YYYY-MM-DD",                 // Target date
    "completed": false,                   // Status
    "date_created": "ISO-8601 Timestamp", // Auto-generated
    "user_id": 1,                         // Output Only
    "user_name": "User Name"              // Output Only
}
```

**Example - Add a new task (PATCH):**
To add a task, you append it to the list. 
**Note:** The API usually replaces the entire list on update, so ensure you send the existing tasks + the new one, OR use a specialized endpoint if available (currently standard REST update replaces field value).

```json
{
    "list_of_tasks": [
        {
            "task": "Previous task",
            "date": "...",
            "completed": true
        },
        {
            "task": "New Follow-up",
            "date": "2025-02-01",
            "completed": false
        }
    ]
}
```

### Retrieve Lead
**GET** `/api/leads/<uuid>/`

### Update Lead
**PUT** `/api/leads/<uuid>/`

**Payload:**
```json
{
    "name": "Interested Student",
    "stage": "Negotiation",
    "responsible": 2
}
```

### Lead Atomic Updates

#### Update Task Status
**POST** `/api/leads/<uuid>/update-task/`
```json
{
    "task_id": "uuid-of-task",
    "completed": true
}
```

#### Delete Note
**POST** `/api/leads/<uuid>/delete-note/`
```json
{
    "id": "uuid-of-note"
}
```

### Delete Lead
**DELETE** `/api/leads/<uuid>/`

#### Lead Fields Reference
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique identifier |
| `name` | String | Name of the lead |
| `responsible` | ForeignKey | User ID of the responsible person |
| `pipeline` | ForeignKey | Pipeline ID |
| `possible_client` | UUID | Optional link to an existing client |
| `moodle_course_id` | String | Optional Moodle Course ID |
| `stage` | String | Current stage name |
| `attributes` | JSONB | Dynamic attributes |
| `list_of_tasks` | JSONB | List of tasks `{task, date, completed, date_created, user_id (Output Only), user_name (Output Only)}` |
| `list_of_notes` | JSONB | List of notes `{date, note, user_id (Output Only), user_name (Output Only)}` |

---

## 6. Follow-Ups (Service Interactions)

### List Follow-Ups
**GET** `/services/<service_id>/follow-ups/`

### Create Follow-Up
**POST** `/services/<service_id>/follow-ups/`

**Payload:**
```json
{
    "attributes": {
        "channel": "email"
    },
    "follow_up_date": "2025-01-15T10:00:00Z",
    "comment": "Sent brochure."
}
```

### Retrieve Follow-Up
**GET** `/services/<service_id>/follow-ups/<uuid>/`

### Update Follow-Up
**PUT** `/services/<service_id>/follow-ups/<uuid>/`

**Payload:**
```json
{
    "comment": "Sent updated brochure and pricing.",
    "follow_up_date": "2025-01-16T10:00:00Z"
}
```

### Delete Follow-Up
**DELETE** `/services/<service_id>/follow-ups/<uuid>/`

---

## 7. Cohorts

### List Cohorts
**GET** `/api/cohorts/`

### Create Cohort
**POST** `/api/cohorts/`

**Payload:**
```json
{
    "name_cohort": "Summer 2025",
    "start_date": "2025-06-01",
    "end_date": "2025-12-01",
    "instructor": 1
}
```

### Retrieve Cohort
**GET** `/api/cohorts/<uuid>/`

### Update Cohort
**PUT** `/api/cohorts/<uuid>/`

**Payload:**
```json
{
    "name_cohort": "Summer 2025 - EXTENDED",
    "end_date": "2026-01-31"
}
```

### Delete Cohort
**DELETE** `/api/cohorts/<uuid>/`

#### Cohort Fields Reference
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique identifier |
| `name_cohort` | String | Name of the cohort |
| `start_date` | Date | Start date (YYYY-MM-DD) |
| `end_date` | Date | End date (YYYY-MM-DD) |
| `instructor` | ForeignKey | User ID of the instructor |


## 8. Enrollments
Links a Cohort to an Instructor and a Pathway.

### List Enrollments
**GET** `/api/enrollments/`

### Create Enrollment
**POST** `/api/enrollments/`

**Payload:**
```json
{
    "cohort": "<cohort_uuid>",
    "pathway_name": "Data Science",
    "instructor": 1,
    "teaching_assistants": [
        {"id": 2, "name": "TA Bob"}
    ]
}
```

### Retrieve Enrollment
**GET** `/api/enrollments/<uuid>/`

### Delete Enrollment
**DELETE** `/api/enrollments/<uuid>/`

#### Enrollment Fields Reference
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique identifier |
| `cohort` | ForeignKey | Cohort ID |
| `instructor` | ForeignKey | Lead Instructor ID |
| `pathway_name` | String | Name of the educational pathway |
| `teaching_assistants` | JSONB | List of TAs `[{"id": 1, "name": "..."}]` |

---

## 9. Enrollment Details
Links a specific Student (Service) to an Enrollment.

### List Details
**GET** `/api/enrollment-details/`

### Create Detail
**POST** `/api/enrollment-details/`

**Payload:**
```json
{
    "enrollment": "<enrollment_uuid>",
    "student": "<student_service_uuid>"
}
```

### Delete Detail
**DELETE** `/api/enrollment-details/<uuid>/`

---

## 10. Transfer Requests

### List Requests
**GET** `/api/transfer-requests/`

### Create Request
**POST** `/api/transfer-requests/`

**Payload:**
```json
{
    "student": "<student_service_uuid>",
    "cohort_request": "Winter 2026 Batch",
    "possible_transfer_date": "2026-02-01"
}
```

### Update Request
**PUT/PATCH** `/api/transfer-requests/<uuid>/`

### Delete Request
**DELETE** `/api/transfer-requests/<uuid>/`

#### Transfer Request Fields Reference
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique identifier |
| `student` | ForeignKey | Service (Student) ID |
| `student_name` | String | Name of the student (Output Only) |
| `cohort_request` | String | Name of the requested cohort |
| `possible_transfer_date` | Date | Requested transfer date (YYYY-MM-DD) |

---

## 11. File Uploads
Files are stored in S3 and linked to entities.

### Upload Service (Student) Image
**POST** `/api/services/<uuid>/files/`
*Content-Type: multipart/form-data* 
*Body: file=<binary_data>*

**Response:**
```json
{
    "url": "https://bucket.s3.amazonaws.com/services/uuid/image.jpg",
    "list_of_images": ["url1", "url2"]
}
```

### Upload Client Image
**POST** `/api/clients/<uuid>/files/`
*Content-Type: multipart/form-data* 
*Body: file=<binary_data>*

---

## 12. Users (Read-Only Lists)

### List Instructors
**GET** `/api/instructors/`
Returns users in the 'Instructors' group.

### List TAs
**GET** `/api/tas/`
Returns users in the 'Teacher Assistant' group.

### List Sales
**GET** `/api/sales/`
Returns users in the 'Sales' group.

### List Operations
**GET** `/api/operations/`
Returns users in the 'Operations' group.


## 13. Webhooks
Webhooks allow you to configure HTTP callbacks triggered by events on Leads, Clients, Services, or FollowUps.

### List Webhooks
**GET** `/api/webhooks/`

### Create Webhook
**POST** `/api/webhooks/`

**Payload:**
```json
{
    "name": "Notify External System",
    "model": "Lead",            // Options: Lead, Client, Service, FollowUp
    "url": "https://api.external.com/hooks/{id}",
    "method": "POST",           // Options: POST, PUT, PATCH, DELETE, GET
    "headers": {
        "Authorization": "Bearer token",
        "X-Custom-ID": "{id}"
    },
    "is_active": true,
    "conditions": [            // Optional: Only trigger if these rules pass
        { "field": "stage", "operator": "=", "value": "Moodle" }
    ],
    "condition_logic": "AND"   // Options: AND, OR
}
```

**Conditional Execution:**
You can define a list of `conditions` that must be met for the webhook to trigger.
- **Fields**: Any top-level field of the model (e.g., `stage`, `name`).
- **Operators**: `=`, `!=`, `>`, `<`, `>=`, `<=`, `in`, `contains`.
- **Logic**: 
    - `AND`: All conditions must be true.
    - `OR`: At least one condition must be true.
**Template Substitution:**
You can use `{field_name}` placeholders in `url` and `headers` values. These will be replaced by the corresponding values from the triggered instance (e.g., `{id}`, `{name}`).

### Retrieve Webhook
**GET** `/api/webhooks/<uuid>/`

### Update Webhook
**PUT/PATCH** `/api/webhooks/<uuid>/`

### Delete Webhook
**DELETE** `/api/webhooks/<uuid>/`
