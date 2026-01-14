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
*(entity_name: client, service, lead)*

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
    }
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
        "industry": "Finance"
    }
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
    }
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
    }
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

### Delete Lead
**DELETE** `/api/leads/<uuid>/`

---

## 6. Follow-Ups (Service Interactions)

### List Follow-Ups
**GET** `/services/<service_id>/follow-ups/`

### Create Follow-Up
**POST** `/services/<service_id>/follow-ups/`

**Payload:**
```json
{
    "type": "email", 
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

---

## 8. Attendance

### List Attendances
**GET** `/api/attendances/`

### Create Attendance
**POST** `/api/attendances/`

**Payload:**
```json
{
    "date": "2025-07-01",
    "cohort": "<cohort_uuid>",
    "instructor": 1
}
```

### Retrieve Attendance
**GET** `/api/attendances/<uuid>/`

### Delete Attendance
**DELETE** `/api/attendances/<uuid>/`

---

## 9. Attendance Details
Records individual student presence for a specific attendance sheet.

### List Details
**GET** `/api/attendance-details/`

### Create Detail
**POST** `/api/attendance-details/`

**Payload:**
```json
{
    "attendance": "<attendance_uuid>",
    "service": "<student_service_uuid>",
    "type": "P" // Options: P (Present), A (Absent), E (Excused)
}
```

### Update Detail
**PUT** `/api/attendance-details/<uuid>/`

**Payload:**
```json
{
    "type": "A"
}
```

### Delete Detail
**DELETE** `/api/attendance-details/<uuid>/`

---

## 10. Enrollments
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

---

## 11. Enrollment Details
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

## 12. Transfer Requests

### List Requests
**GET** `/api/transfer-requests/`

### Create Request
**POST** `/api/transfer-requests/`

**Payload:**
```json
{
    "student": "<student_service_uuid>",
    "cohort_request": "Winter 2026 Batch"
}
```

### Update Request
**PUT/PATCH** `/api/transfer-requests/<uuid>/`

### Delete Request
**DELETE** `/api/transfer-requests/<uuid>/`

---

## 13. File Uploads
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

## 14. Users (Read-Only Lists)

### List Instructors
**GET** `/api/instructors/`
Returns users in the 'Instructors' group.

### List TAs
**GET** `/api/tas/`
Returns users in the 'Teacher Assistant' group.

