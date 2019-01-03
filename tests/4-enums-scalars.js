import { gql, gql2jsonSchema } from '../src';

describe('convert gql enum and scalar types into json constraints', () => {
  test('handles enums', () => {
    const jsonSchema = gql2jsonSchema(gql`
      type Person {
        gender: Gender!
      }
      enum Gender {
        MALE
        FEMALE
        OTHER
      }
    `);
    expect(jsonSchema.properties.gender.type).toBe('string');
    expect(Array.isArray(jsonSchema.properties.gender.enum)).toBe(true);
    expect(jsonSchema.properties.gender.enum).toEqual([
      { name: 'MALE', value: 'MALE' },
      { name: 'FEMALE', value: 'FEMALE' },
      { name: 'OTHER', value: 'OTHER' },
    ]);
  });
  test('finds descriptions for enums', () => {
    const jsonSchema = gql2jsonSchema(gql`
      type Person {
        gender: Gender!
      }
      "boy or girl"
      enum Gender {
        "a boy"
        MALE
        "a girl"
        FEMALE
      }
    `);
    expect(jsonSchema.properties.gender.description).toBe('boy or girl');
    expect(jsonSchema.properties.gender.enum).toEqual([
      { name: 'MALE', value: 'MALE', description: 'a boy' },
      { name: 'FEMALE', value: 'FEMALE', description: 'a girl' },
    ]);
  });
  test('handles custom scalars', () => {
    const jsonSchema = gql2jsonSchema(gql`
      type Document {
        filePath: FilePath
      }
      scalar FilePath
    `);
    expect(jsonSchema.properties.filePath.type).toBe('string');
    expect(jsonSchema.properties.filePath.name).toBe('FilePath');
  });
  test('handles predefined scalars', () => {
    const jsonSchema = gql2jsonSchema(gql`
      type Persom {
        email: Email
        website: Url
        birthdate: DateTime
        wakeUpTime: Time
        nameDay: Date
        bio: Markdown
      }
    `);
    expect(jsonSchema.properties.email.type).toBe('string');
    expect(jsonSchema.properties.email.format).toBe('email');
    expect(jsonSchema.properties.website.type).toBe('string');
    expect(jsonSchema.properties.website.format).toBe('url');
    expect(jsonSchema.properties.birthdate.type).toBe('string');
    expect(jsonSchema.properties.birthdate.format).toBe('date-time');
    expect(jsonSchema.properties.wakeUpTime.type).toBe('string');
    expect(jsonSchema.properties.wakeUpTime.format).toBe('time');
    expect(jsonSchema.properties.nameDay.type).toBe('string');
    expect(jsonSchema.properties.nameDay.format).toBe('date');
    expect(jsonSchema.properties.bio.type).toBe('string');
    expect(jsonSchema.properties.bio.format).toBe('markdown');
  });
});
