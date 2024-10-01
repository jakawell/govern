# Validation service

The validation service is a stateless, public service for validating referenda against a global referenda schema and 
for validating ballots against the schema defined by referenda.

* Data storage
  * None; stateless
* Authentication
  * None; public
* Cryptography
  * Public keypair for signatures
* Security level
  * Moderate (3rd party packages can be used)

## Endpoints

### `GET global-referenda-schema`

Returns the JSON Schema defining a referenda schema.

Example request:
```http
GET /global-referenda-schema HTTP/1.1
```

Example success response:

**HTTP 200**
```json
{
    "$schema": "http://json-schema.org/2020-12/schema",
    "$id": "https://example.com/govern/referenda.v1.schema.json",
    "title": "Referenda",
    "type": "object",
    "properties": {
        ...
    }
}
```

### `POST referendum`

Validates the provided referendum against the global referenda schema. If validated, returns a signed hash of the
referendum as evidence of the validation. Otherwise, provides the JSON Schema error(s).

#### Body

The body is any JSON object with no specific format requirements to be ingested for validation.

Example request:
```http
POST /referendum HTTP/1.1
Content-Type: application/json
Accept: application/json

{
  "globalId": "4f435278-7827-4760-a35c-3cb8681e36e0"
  "name": "North Carolina District 12, Weekly, 09 October, 2023",
  "date": "2023-10-09T00:00:00Z",
  "measures": [
    {
      "id": "ballot-measure-1",
      "description": "Should Ballot Measure #1 be approved?",
      "type": "single-choice",
      "options": [
        {
          "id": "yes",
          "description": "Yes"
        },
        {
          "id": "no",
          "description": "No"
        }
      ]
    }
  ]
}
```

Example success response:

**HTTP 201**
```json
{
    "status": "Valid",
    "signature": "AB1239049CF19301848101393931938831901309189893190089A3983309809D09809132840E9"
}
```

Example failure response:

**HTTP 400**
```json
{
  "status": "Invalid",
  "errors": [
    {
      "path": "measures[1].type",
      "message": "Measure type must be one of allowed values."
    }
  ]
}
```

### `POST ballot`

Validates the provided ballot against the provided referenda schema. If validated, returns a signed hash of the
ballot and referendum global ID as evidence of the validation. Otherwise, provides the JSON Schema error(s).

#### Body

JSON body with two attributes:

* `ballot`: Object; any JSON object with no specific format requirements to be ingested for validation
* `referendumValidationSignature`: string; The signature previously obtained from the service validating the referendum
* `referendum`: Object; any JSON object of the referendum that was signed by the `referendumValidationSignature`

Example request:
```http
POST /ballot HTTP/1.1
Content-Type: application/json
Accept: application/json

{
  "ballot": {
    ...
  },
  "referendumValidationSignature": "AB1239049CF19301848101393931938831901309189893190089A3983309809D09809132840E9",
  "referendum": {
    ...
  }
}
```

Example success response:

**HTTP 201**
```json
{
    "status": "Valid",
    "signature": "AB1239049CF19301848101393931938831901309189893190089A3983309809D09809132840E9"
}
```

Example failure response:

**HTTP 400**
```json
{
  "status": "Invalid",
  "errors": [
    {
      "path": "measures[1].vote",
      "message": "Vote must be one of allowed values."
    }
  ]
}
```
