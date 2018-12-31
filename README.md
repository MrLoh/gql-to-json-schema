# graphSchemaToJson

Convert executable graphql schema to JSON.

_Usage_

    import { schemaToJS } from "../src/schema";
    import { makeExecutableSchema } from "graphql-tools";

    const typeDefs = `
    type Person {
    name: String!
    age: Int! @range(min: 0, max: 130)
    gender: Gender!
    }

    enum Gender {
    male
    female
    }
    `;

    const schema = makeExecutableSchema({ typeDefs, resolvers: {} });
    const jsSchema = schemaToJS(schema);

    console.log(jsSchema);

See the `/examples` folder.

Run `person.ts`:

`$ ts-node examples/person.ts`

_See Also_

- [GraphQL Gen TypeORM](https://github.com/jjwtay/graphGenTypeorm) - auto graphql generation of typeorm Entity-Schema, Resolvers, graphql mutation/queries.

## Sample

### GraphQL schema definition

```graphql
type Person {
  name: String!
  age: Int! @range(min: 0, max: 130)
  gender: Gender!
}

enum Gender {
  male
  female
}
```

### JSON Output

```js
{
  __Schema: {
  },
  Person: {
    fields: {
      name: {
        type: 'String',
        directives: {},
        isNullable: false,
        isList: false
      },
      age: {
        type: 'Int',
        directives: {
          range: {
            min: 0,
            max: 130
          }
        },
        isNullable: false,
        isList: false
      },
      gender: {
        type: 'Gender',
        directives: {},
        isNullable: false,
        isList: false
      }
    },
    directives: {},
    type: 'Object',
    implements: []
  },
  Gender: {
    fields: ['male', 'female'],
    directives: {},
    type: 'Enum'
  }
}
```

## Accessor

```js
import { schemaToJS } from "../src/schema";
import { accessor } from "graph-schema-json-writer";
const { schemaByType, filteredSchema } = accessor;
/// ... generate JSON schema
const jsSchema = schemaToJS(schema);

// schema where all entries with keys starting with __ are filtered out
const filteredMap = filteredSchema(jsSchema);

// soreted by type
const typeMap = schemaByType(jsSchema);
console.log(typeMap);
```

```js
{
    Object: {
        Person: {
            // ....
        }
    },
    Enum: {
        Gender: {
            // ...
        }
    }
}
```

## Writer

```js
import { schemaToJS } from "../src/schema";
import { writer } from "graph-schema-json-writer";
const { writeToTypeDef } = writer;
/// ... generate JSON schema
const jsSchema = schemaToJS(schema);

// schema where all entries with keys starting with __ are filtered out
const typeDef = writeToTypeDef(jsSchema);
console.log(typeDef);
```

Should output the (original) GraphqL type def, nicely formatted:

```graphql
type Person {
  name: String!
  age: Int! @range(min: 0, max: 130)
  gender: Gender!
}

enum Gender {
  male
  female
}
```

Note: The writer now also supports writing a TypeScript `class`, complete with `extends` class, implements `interfaces`, decorators for class itself and fields and properties.

This class writer could be used for writing classed for [TypeORM](http://typeorm.io/#/), [NestJS](https://nestjs.com/) or [TypeGraphQL](https://19majkel94.github.io/type-graphql/) etc.

Note that the class writer supports passing `decorators` in place of `directives`.

## TODO

- Add `directivesKeys: string[]` to `fields` since directives order matters.
- Figure out better way to use `astNodes` than all the guards and guessing.
- Clean up codebase.
