# Convert GraphQL Types into Nested JSON Schema

Convert a GraphQL schema into a JSON Schema, supporting custom scalars and enums, nesting of lists as arrays and referenced types as objects, and defining custom directives as constraints.

This does not support recursive type definitions, as it is intended for auto generating forms.

The output can be used to generate a form, and validate it by levaraging [json-schema-to-yup](https://github.com/kristianmandrup/json-schema-to-yup).

## Ecample

The following code:

```js
import { gql, gql2jsonSchema } from 'gql-to-json-schema';

const jsonSchema = gql2jsonSchema(gql`
  "a random document"
  type Document {
    tags: [Tag!]!
    filePath: FilePath
  }
  type Tag {
    title: String!
    "who added the tag"
    author: User!
  }
  type User {
    name: String!
    gender: Gender!
    age: Int @minimum(_: 0)
    email: Email
    website: Url
    birthdate: DateTime
  }
  enum Gender {
    MALE
    FEMALE
    OTHER
  }
  scalar FilePath
  directive @minimum(_: Int!) on FIELD_DEFINITION
`);
```

Yields this JSON schema

```json
{
  "title": "Document",
  "type": "object",
  "description": "a random document",
  "name": "Document",
  "properties": {
    "tags": {
      "type": "array",
      "nullable": false,
      "items": {
        "type": "object",
        "nullable": false,
        "name": "Tag",
        "properties": {
          "title": {
            "type": "string",
            "nullable": false
          },
          "author": {
            "type": "object",
            "nullable": false,
            "description": "who added the tag",
            "name": "User",
            "properties": {
              "name": {
                "type": "string",
                "nullable": false
              },
              "gender": {
                "type": "string",
                "nullable": false,
                "name": "Gender",
                "enum": [
                  {
                    "name": "MALE",
                    "value": "MALE"
                  },
                  {
                    "name": "FEMALE",
                    "value": "FEMALE"
                  },
                  {
                    "name": "OTHER",
                    "value": "OTHER"
                  }
                ]
              },
              "age": {
                "type": "integer",
                "nullable": true,
                "minimum": 0
              },
              "email": {
                "type": "string",
                "nullable": true,
                "format": "email",
                "name": "Email"
              },
              "website": {
                "type": "string",
                "nullable": true,
                "format": "url",
                "name": "Url"
              },
              "birthdate": {
                "type": "string",
                "nullable": true,
                "format": "date-time",
                "name": "DateTime"
              }
            },
            "required": ["name", "gender"]
          }
        },
        "required": ["title", "author"]
      }
    },
    "filePath": {
      "type": "string",
      "nullable": true,
      "name": "FilePath"
    }
  },
  "required": ["tags"]
}
```
