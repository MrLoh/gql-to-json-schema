import { gql2jsonSchema } from '../src';

describe('conversion of trivial graphql schemas', () => {
  test('basic functionality', () => {
    const jsonSchema = gql2jsonSchema(
      /* GraphQL */ `
        type Person {
          name: String
        }
      `,
      'Person'
    );
    expect(jsonSchema.title).toBe('Person');
    expect(jsonSchema.type).toBe('object');
    expect(jsonSchema.properties).toEqual({ name: { type: 'string', nullable: true } });
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
