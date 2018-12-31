# Convert GraphQL to JSON and Yup schema

## Usage

```graphql
type Person {
  name: String!
  age: String @range(min: 0, max: 130)
  gender: Gender!
  roles: [Role!]!
  picture: Url
}
type Role {
  icon: String!
  name: String!
  description: String
}
type Url {
  href: String
  size: Int
}
enum Gender {
  MALE
  FEMALE
}
```

```js
import { gql2jsonSchema } from 'schema-converter-gql-json-yup';

const jsonSchema = gql2jsonSchema(typeDefs);
```

## Similar Projects

This was based on [json-schema-to-yup](https://github.com/kristianmandrup/json-schema-to-yup) and [graphSchemaToJson](https://github.com/jjwtay/graphSchemaToJson), but extended, simplified and optimized for the specific usecase. It also provides a properly exported module.
