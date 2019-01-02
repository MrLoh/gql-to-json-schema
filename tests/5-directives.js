import { gql2jsonSchema } from '../src';

describe('convert provided directives into schema constraints', () => {
  test.skip('basic functionality', () => {
    const jsonSchema = gql2jsonSchema(/* GraphQL */ `
      type Document {
        tags: [String]
      }
    `);
    expect(jsonSchema.properties).toEqual({
      tags: { type: 'array', nullable: true, items: { type: 'string', nullable: true } },
    });
  });
});
