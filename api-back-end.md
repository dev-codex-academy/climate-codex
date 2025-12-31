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

### 4. Clients
**POST** `/api/clients/`
```json
{
    "name": "Acme Corp",
    "attributes": {
        "industry": "Technology" // Must match defined attributes
    }
}
```

### 5. Services
**POST** `/api/services/`
```json
{
    "name": "Website Redesign",
    "client": "<CLIENT_UUID>",
    "attributes": {
        "duration": "3 months"
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
