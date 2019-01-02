// import { buildYup } from 'json-schema-to-yup';
// import { schemaToJS } from './gql2json';
export * from './gql2json';

// export const gql2jsonSchema = (typeDefs, baseType) => {
//   // get first type to be the base type
//   if (!baseType) baseType = typeDefs.match(/\s*type\s*(\w*)/)[1];
//   // build gql schema object from type defs
//   const gqlSchema = buildSchema(typeDefs + 'type Query { pass: Int }');
//   // convert gql schema to json schema and filter out default types
//   const jsSchemaObjects = Object.assign(
//     ...Object.entries(schemaToJS(gqlSchema))
//       .filter(([key]) => key.substring(0, 2) !== '__' && key !== 'Query')
//       .map(([key, value]) => ({ [key]: value }))
//   );
//   // function to nest schema object
//   const resolveTypes = (type) => ({
//     name: type,
//     ...jsSchemaObjects[type],
//     fields: Object.assign(
//       ...Object.entries(jsSchemaObjects[type].fields).map(([key, value]) => ({
//         [key]: value.type in jsSchemaObjects ? { ...value, ...resolveTypes(value.type) } : value,
//       }))
//     ),
//   });
//   // return nested json schema for base type
//   return resolveTypes(baseType);
// };

// export const json2yupSchema = (jsSchema) =>
//   buildYup(jsSchema, {
//     schemaType: 'type-def',
//     getType: (obj) => obj.type.toLowerCase(),
//   });

// export const gql2yupSchema = (typeDefs) => json2yupSchema(gql2jsonSchema(typeDefs));
