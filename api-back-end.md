# CRM API Documentation

This API enables management of Clients, Services, Leads, and Pipelines with a dynamic attribute system.

## Authentication
The API uses Token Authentication. You must obtain a token and send it in the header of every request.

**Header**: `Authorization: Token <your_token>`

### 1. Obtain Token
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

---

## Dynamic Attributes (CRITICAL)
**IMPORTANT:** Before creating Clients, Services, or Leads, you **MUST** define their attributes. If you try to create an entity without defined attributes, you will receive a `400 Bad Request`.

### 2. Define Attributes
**POST** `/api/attributes/<entity_name>/`
- `entity_name`: `client`, `service`, or `lead`.

**Body:**
```json
{
    "name": "industry",
    "label": "Industry Sector",
    "type": "text",   // Options: text, number, date, boolean, list
    "is_required": true
}
```

### 3. List Attributes
**GET** `/api/attributes/<entity_name>/`

---

## Entities

### 4. Client (They pay the students scholarship)
**POST** `/api/clients/`
```json
{
    "name": "Alice Johnson",
    "attributes": {
        "industry": "Education" 
    }
}
```

### 5. Service (Student)
**POST** `/api/services/`
```json
{
    "name": "John Doe (Student)",
    "client": "<CLIENT_UUID>",
    "attributes": {
        "duration": "6 months"
    }
}
```

### 6. Pipelines
Pipelines have custom stages defined in JSON.

**POST** `/api/pipelines/`
```json
{
    "name": "B2B Sales",
    "stages": [
        {"name": "Prospecting", "color": "#6c6f73", "order": 1},
        {"name": "Negotiation", "color": "#007bff", "order": 2},
        {"name": "Closed", "color": "#28a745", "order": 3}
    ]
}
```

### 7. Leads
**POST** `/api/leads/`
```json
{
    "name": "John Doe",
    "responsible": <USER_ID>,
    "attributes": {
        "source": "LinkedIn"
    }
}
```

---

## Filtering
All endpoints support filtering by any field via query parameters.

**Examples:**
- `GET /api/clients/?name=Acme`
- `GET /api/services/?client=<CLIENT_UUID>`
- `GET /api/leads/?responsible=1`
- `GET /api/pipelines/?name=Sales`

---

## Files & Images (S3)

### 8. Upload Service Image
**POST** `/api/services/<id>/files/`
- **Content-Type**: `multipart/form-data`
- **Body**: `file` (Binary Image)

**Response:**
```json
{
    "url": "https://<bucket>.s3.<region>.amazonaws.com/services/<id>/<uuid>.jpg",
    "list_of_images": ["https://...", "https://..."]
}
```

### 9. Upload Client Image
**POST** `/api/clients/<id>/files/`
- **Content-Type**: `multipart/form-data`
- **Body**: `file` (Binary Image)

**Response:**
```json
{
    "url": "https://<bucket>.s3.<region>.amazonaws.com/clients/<id>/<uuid>.jpg",
    "list_of_images": ["https://...", "https://..."]
}
```

---

## Attendance

### 10. Cohorts
**POST** `/api/cohorts/`
```json
{
    "name_cohort": "Summer 2025",
    "start_date": "2025-06-01",
    "end_date": "2025-12-01",
    "instructor": <USER_ID>
}
```

### 11. Attendance
**POST** `/api/attendances/`
```json
{
    "date": "2024-01-01",
    "cohort": <COHORT_ID>,
    "instructor": <USER_ID>
}
```

### 12. Attendance Details
**POST** `/api/attendance-details/`
```json
{
    "attendance": <ATTENDANCE_ID>,
    "service": <SERVICE_ID>,
    "type": "P" // A=Absent, P=Present, E=Excused
}
```

### 13. Transfer Requests
**POST** `/api/transfer-requests/`
```json
{
    "student": <SERVICE_ID>,
    "cohort_request": "Target Cohort 2025"
}
```

---

## Pathways & Enrollments

### 14. Enrollments
**POST** `/api/enrollments/`
```json
{
    "cohort": "<COHORT_ID>",
    "pathway_name": "Data Science Path",
    "instructor": <USER_ID>
}
```

### 15. Enrollment Details
**POST** `/api/enrollment-details/`
```json
{
    "enrollment": "<ENROLLMENT_ID>",
    "student": "<SERVICE_ID>"
}
```
