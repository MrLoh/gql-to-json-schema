import { gql2jsonSchema } from '../src';

describe('convert trivial gql schemas', () => {
  test('basic functionality', () => {
    const jsonSchema = gql2jsonSchema(
      /* GraphQL */ `
        type Person {
          name: String
          married: Boolean
          numberOfKids: Int
          weight: Float
        }
      `,
      'Person'
    );
    expect(jsonSchema.title).toBe('Person');
    expect(jsonSchema.type).toBe('object');
    expect(typeof jsonSchema.properties).toBe('object');
    expect(jsonSchema.properties.name.type).toBe('string');
    expect(jsonSchema.properties.married.type).toBe('boolean');
    expect(jsonSchema.properties.numberOfKids.type).toBe('integer');
    expect(jsonSchema.properties.weight.type).toBe('number');
  });
  test('infers base type', () => {
    const jsonSchema = gql2jsonSchema(/* GraphQL */ `
      type Person {
        name: String
      }
    `);
    expect(jsonSchema.title).toBe('Person');
  });
  test('finds descriptions', () => {
    const jsonSchema = gql2jsonSchema(/* GraphQL */ `
      "a typical person"
      type Person {
        "the name of the person"
        name: String
      }
    `);
    expect(jsonSchema.description).toBe('a typical person');
    expect(jsonSchema.properties.name.description).toBe('the name of the person');
  });
  test('detects nullability', () => {
    const jsonSchema = gql2jsonSchema(
      /* GraphQL */ `
        type Person {
          name: String!
          nickName: String
        }
      `,
      'Person'
    );
    expect(jsonSchema.properties.name.nullable).toBe(false);
  });
});
