import { gql, gql2jsonSchema } from '../src';

describe('convert provided directives into schema constraints', () => {
  test('custom directive', () => {
    const jsonSchema = gql2jsonSchema(gql`
      type Person {
        test: String @example(description: "there is no example")
      }
      directive @example(description: String!) on FIELD_DEFINITION
    `);
    expect(typeof jsonSchema.properties.test.example).toBe('object');
    expect(jsonSchema.properties.test.example).toEqual({ description: 'there is no example' });
  });
  test('directives without value are supported', () => {
    const jsonSchema = gql2jsonSchema(gql`
      type Person {
        test: String @exampled
      }
      directive @exampled on FIELD_DEFINITION
    `);
    expect(jsonSchema.properties.test.exampled).toBe(true);
  });
  test('directive `_` argument generates flat constraint value', () => {
    const jsonSchema = gql2jsonSchema(gql`
      type Person {
        test: String @example(_: "there is no example")
      }
      directive @example(_: String!) on FIELD_DEFINITION
    `);
    expect(jsonSchema.properties.test.example).toBe('there is no example');
  });
});
