import { gql2jsonSchema } from '../src';

describe('convert referenced gql types into nested json objects', () => {
  test('basic functionality', () => {
    const jsonSchema = gql2jsonSchema(/* GraphQL */ `
      type Document {
        author: Person
      }
      type Person {
        name: String
      }
    `);
    expect(jsonSchema.properties.author.type).toBe('object');
    expect(jsonSchema.properties.author.name).toBe('Person');
    expect(jsonSchema.properties.author.properties).toEqual({
      name: { type: 'string', nullable: true },
    });
  });
  test('detects nullability', () => {
    expect(
      gql2jsonSchema(/* GraphQL */ `
        type Document {
          author: Person!
        }
        type Person {
          name: String
        }
      `).properties.author.nullable
    ).toBe(false);
  });
  test('finds descriptions', () => {
    const jsonSchema = gql2jsonSchema(/* GraphQL */ `
      "a random document"
      type Document {
        "the author of the document"
        author: Person
      }
      "a random person"
      type Person {
        "how you call them"
        name: String
      }
    `);
    expect(jsonSchema.description).toBe('a random document');
    expect(jsonSchema.properties.author.description).toBe('the author of the document');
    expect(jsonSchema.properties.author.properties.name.description).toBe('how you call them');
  });
  test('handles objects in arrays', () => {
    const jsonSchema = gql2jsonSchema(/* GraphQL */ `
      type Document {
        authors: [Person!]!
      }
      type Person {
        name: String
      }
    `);
    expect(jsonSchema.properties.authors.type).toBe('array');
    expect(jsonSchema.properties.authors.items.type).toBe('object');
    expect(jsonSchema.properties.authors.items.name).toBe('Person');
    expect(jsonSchema.properties.authors.items.properties).toEqual({
      name: { type: 'string', nullable: true },
    });
  });
  test('handles deep nesting', () => {
    const jsonSchema = gql2jsonSchema(/* GraphQL */ `
      type Document {
        tags: [Tag!]!
      }
      type Tag {
        author: Person!
      }
      type Person {
        name: String
      }
    `);
    expect(jsonSchema.properties.tags.type).toBe('array');
    expect(jsonSchema.properties.tags.items.type).toBe('object');
    expect(jsonSchema.properties.tags.items.properties.author.type).toBe('object');
    expect(jsonSchema.properties.tags.items.properties.author.properties).toEqual({
      name: { type: 'string', nullable: true },
    });
  });
  test('throws error for recursive schemas', () => {
    try {
      gql2jsonSchema(/* GraphQL */ `
        type Person {
          friends: [Person!]
        }
      `);
    } catch (e) {
      expect(e.message).toBe('recursive schemas are not supported');
    }
  });
});
