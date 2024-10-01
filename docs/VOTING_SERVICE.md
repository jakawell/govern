# Voting service

The voting service is a stateful, public service for the following tasks:
1. Registering and distributing referenda
2. Accepting and storing ballots

* Data storage
  * Database for storing referenda and ballots
* Authentication
  * None; public
* Cryptography
  * Public keypair for signing ballots
* Security level
  * Critical (highly restricted usage for 3rd party packages)

## Data model

### Referendum

Stores registered referenda that can be sent to voters to vote on.

* `id`: Unique identifier for the referendum
* `validation_signature`: Signature from the validation service for the referendum
* `name`: Name of the referendum
* `date`: Date of the referendum
* `schema`: JSON Schema for the referendum

### Ballot

Stores the ballots of each voter for referenda with verifications that the ballot is validated and voted on. There is 
no reference to the voter.

* `id`: Unique identifier for the ballot
* `referendum_id`: ID of the referendum this ballot is for
* `validation_signature`: Signature from the validation service for the ballot
* `voting_signature`: Signature from the voting service for the ballot
* `votes`: JSON of the ballot

### Vote

Stores the voting "events" for when a voter submits a ballot for a referendum. This shows that a voter has voted, but
only the voter themselves can decrypt the ballot receipt to find their ballot ID.

* `referendum_id`: ID of the referendum this vote is for
* `public_key`: Public key for the voter for this referendum
* `ballot_receipt`: The ballot ID encrypted using the voter's public key

## Endpoints

### `POST /referenda/register`

Registers a new referendum in the voting service.

Example request:
```http
POST /referendum HTTP/1.1
Content-Type: application/json
Accept: application/json

{
  "globalId": "4f435278-7827-4760-a35c-3cb8681e36e0",
  "validationSignature": "AB1239049CF19301848101393931938831901309189893190089A3983309809D09809132840E9",
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
    "status": "Accepted"
}
```

Example failure responses:

**HTTP 400**
```json
{
    "status": "Rejected",
    "error": "Validation signature mismatch"
}
```

**HTTP 409**
```json
{
    "status": "Rejected",
    "error": "Referendum already exists"
}
```

### `GET /referenda`

Returns the registered referenda avaiable for a voter to vote on.

**TODO:** This process needs to be developed. There needs to be a system for verifying a voter's access to referenda to
ensure they only vote on things they're allowed to vote on. This will probably require an extension to the validation
service, or an entirely new "access service".

#### Parameters

| Name | Type | Description | Is Required |
| ---- | ---- | ----------- | ----------- |
| `publicKey` | `string` | Public key of the voter | Yes

Example request:

```http
GET /referenda?publicKey=AB1239049CF19301848101393931938831901309189893190089A3983309809D09809132840E9 HTTP/1.1
```

Example success response:

**HTTP 200**
```json
[
  {
    "id": "4f435278-7827-4760-a35c-3cb8681e36e0",
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
  // ... other referenda
]
```

### `POST /ballot`

Accepts a ballot for a referendum.

| Name | Type | Description | Is Required |
| ---- | ---- | ----------- | ----------- |
| `publicKey` | `string` | Public key of the voter | Yes

Example request:

```http
POST /ballot?publicKey=AB1239049CF19301848101393931938831901309189893190089A3983309809D09809132840E9 HTTP/1.1
Content-Type: application/json
Accept: application/json

{
  "ballot": {
    "referendum_id": "4f435278-7827-4760-a35c-3cb8681e36e0",
    "validation_signature": "AB1239049CF19301848101393931938831901309189893190089A3983309809D09809132840E9",
    "voter_signature": "AB1239049CF19301848101393931938831901309189893190089A3983309809D09809132840E9",
    "measures": {
      "ballot_measure_1": "yes"
    }
  }
}
```

Example success response:

**HTTP 201**
```json
{
    "status": "Accepted",
    "referendum_id": "4f435278-7827-4760-a35c-3cb8681e36e0",
    "ballot_receipt": "ab1239049cf19301848101393931938831901309189893190089a3983309809d09809132840e9"
}
```

Example failure responses:

**HTTP 400**
```json
{
    "status": "Rejected",
    "error": "Validation signature mismatch"
}
```

**HTTP 400**
```json
{
    "status": "Rejected",
    "error": "Voter signature mismatch"
}
```

**HTTP 404**
```json
{
    "status": "Rejected",
    "error": "Referendum not found"
}
```

**HTTP 409**
```json
{
    "status": "Rejected",
    "error": "Voter has already voted on this referendum"
}
```
