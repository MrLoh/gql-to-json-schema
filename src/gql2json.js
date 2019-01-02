import { buildSchema } from 'graphql';

// import { getDirectives } from './directive';

// const CONSTANTS = {
//   ENUM: 'Enum',
//   FLOAT_VALUE: 'FloatValue',
//   GRAPHQL_INPUT_TYPE: 'GraphQLInputObjectType',
//   GRAPHQL_INTERFACE_TYPE: 'GraphQLInterfaceType',
//   GRAPHQL_UNION_TYPE: 'GraphQLUnionType',
//   GRAPHQL_LIST: 'GraphQLList',
//   GRAPHQL_NON_NULL: 'GraphQLNonNull',
//   GRAPHQL_OBJECT_TYPE: 'GraphQLObjectType',
//   GRAPHQL_SCALAR_TYPE: 'GraphQLScalarType',
//   GRAPHQL_ENUM_TYPE: 'GraphQLEnumType',
//   INPUT: 'Input',
//   INTERFACE: 'Interface',
//   INT_VALUE: 'IntValue',
//   LIST_TYPE: 'ListType',
//   LIST_VALUE: 'ListValue',
//   NON_NULL_TYPE: 'NonNullType',
//   OBJECT: 'Object',
//   OBJECT_VALUE: 'ObjectValue',
//   STRING_VALUE: 'StringValue',
// };

// export const filterByDirective = (name, fields) =>
//   Object.keys(fields).reduce((filteredFields, fieldKey) => {
//     const field = fields[fieldKey];
//     if (field.astNode.directives) {
//       if (field.astNode.directives.find((directive) => directive.name.value === name)) {
//         return { ...filteredFields, [fieldKey]: fields[fieldKey] };
//       }
//     }
//     return filteredFields;
//   }, {});

// export const convertDirectives = (type) => {
//   switch (type.constructor.name) {
//     case CONSTANTS.GRAPHQL_ENUM_TYPE:
//       if (type.astNode) {
//         return getDirectives(type);
//       }
//       return {};

//     case CONSTANTS.OBJECT:
//       if (type.astNode) {
//         return getDirectives(type);
//       }
//       return {};

//     case CONSTANTS.GRAPHQL_OBJECT_TYPE:
//       if (type.astNode) {
//         return getDirectives(type);
//       }
//       return {};

//     default:
//       console.log('convertDirectives unhandled: ', type.constructor.name);
//       return {};
//   }
// };

// export const normalizeType = (type) => {
//   const map = {
//     String: 'string',
//     Int: 'number',
//     Float: 'float',
//   };

//   return map[type] ? map[type] : type;
// };

// export const convertField = (field) => {
//   const getNonNullable = (field) => {
//     if (field.astNode) {
//       return field.astNode.type.kind !== CONSTANTS.NON_NULL_TYPE;
//     }
//     return true;
//   };

//   const getIsList = (field) => {
//     if (field.astNode) {
//       if (field.astNode.type.kind === CONSTANTS.LIST_TYPE) {
//         return true;
//       } else if (field.astNode.type.kind === CONSTANTS.NON_NULL_TYPE) {
//         if (field.astNode.type.type.kind === CONSTANTS.LIST_TYPE) {
//           return true;
//         } else {
//           return false;
//         }
//       } else {
//         return false;
//       }
//     }
//     return false;
//   };

//   switch (field.constructor.name) {
//     case CONSTANTS.OBJECT:
//       return {
//         type: getType(field),
//         directives: convertDirectives(field),
//         isNullable: getNonNullable(field),
//         isList: getIsList(field),
//       };
//     default:
//       console.log('convertField unhandled type: ', field.constructor.name);
//       return {};
//   }
// };

// export const convertFields = (fields) =>
//   Object.keys(fields).reduce(
//     (newFields, fieldKey) => ({
//       ...newFields,
//       [fieldKey]: convertField(fields[fieldKey]),
//     }),
//     {}
//   );

// export const convertObjectType = (type) => ({
//   fields: convertFields(type.getFields()),
//   directives: convertDirectives(type),
//   type: CONSTANTS.OBJECT,
//   implements: type.getInterfaces().map((int) => int.name),
// });

// export const convertEnumType = (enumType) => ({
//   fields: enumType.getValues().map((val) => val.name),
//   directives: convertDirectives(enumType),
//   type: CONSTANTS.ENUM,
// });

// export const convertInterfaceType = (interfaceType) => ({
//   fields: convertFields(interfaceType.getFields()),
//   directives: convertDirectives(interfaceType),
//   type: CONSTANTS.INTERFACE,
//   implements: [],
// });

// export const convertUnionType = (unionType) => ({
//   name: unionType.name,
//   types: unionType.types,
// });

// export const convertInputType = (inputType) => ({
//   fields: convertFields(inputType.getFields()),
//   directives: convertDirectives(inputType),
//   type: CONSTANTS.INPUT,
//   implements: [],
// });

// export const convertTypeMap = (typeMap) => {
//   const newTypeMap = {};
//   Object.keys(typeMap).forEach((typeKey) => {
//     switch (typeMap[typeKey].constructor.name) {
//       case CONSTANTS.GRAPHQL_ENUM_TYPE:
//         newTypeMap[typeKey] = convertEnumType(typeMap[typeKey]);
//         break;
//       case CONSTANTS.GRAPHQL_OBJECT_TYPE:
//         newTypeMap[typeKey] = convertObjectType(typeMap[typeKey]);
//         break;
//       case CONSTANTS.GRAPHQL_INTERFACE_TYPE:
//         newTypeMap[typeKey] = convertInterfaceType(typeMap[typeKey]);
//         break;
//       case CONSTANTS.GRAPHQL_INPUT_TYPE:
//         newTypeMap[typeKey] = convertInputType(typeMap[typeKey]);
//       case CONSTANTS.GRAPHQL_UNION_TYPE:
//         newTypeMap[typeKey] = convertUnionType(typeMap[typeKey]);
//       default:
//         break;
//     }
//   });
//   return newTypeMap;
// };

// export const schemaToJS = (schema) => {
//   return convertTypeMap(schema.getTypeMap());
// };

//
//
//
//
//

const getTypeName = (def) => {
  if (def.astNode) {
    let node = def.astNode;
    while (node.type) node = node.type;
    return node.name.value;
  } else {
    return def.name;
  }
};

const getKinds = (def) => {
  if (!def) return [];
  if (def.astNode) {
    // the ast contains a nested object structure
    const kinds = [];
    let node = def.astNode;
    do {
      kinds.push(node.kind);
      node = node.type;
    } while (node);
    return kinds;
  } else {
    return ['ScalarTypeDefinition', 'DefaultTypeDefinition'];
  }
};

const getType = ({ typeName, fieldKinds, typeKinds }) => {
  if (fieldKinds.includes('ListType')) return 'array';
  if ([...typeKinds, ...fieldKinds].includes('ObjectTypeDefinition')) return 'object';
  return typeName.toLowerCase();
};

const getConstraints = ({ fieldKinds }) => {
  const constraints = {};
  if (fieldKinds.length > 0) {
    constraints.nullable = fieldKinds[1] !== 'NonNullType';
  }
  return constraints;
};

const getTypeAndConstraints = (typeProps) => ({
  type: getType(typeProps),
  ...getConstraints(typeProps),
});

const getDescription = ({ typeDefinition, fieldDefinition, typeKinds }) => {
  if (fieldDefinition && fieldDefinition.description) return fieldDefinition.description;
  if (!typeKinds.includes('DefaultTypeDefinition') && typeDefinition.description)
    return typeDefinition.description;
};

export const gql2jsonSchema = (typeDefs, baseType) => {
  // if not specified, infer first type to be the base type
  if (!baseType) baseType = typeDefs.match(/\s*type\s*(\w*)/)[1];
  // build gql schema object from type defs and get map of relevant types
  const gqlSchema = buildSchema(typeDefs + 'type Query { pass: Int }');
  const typeMap = Object.assign(
    ...Object.entries(gqlSchema.getTypeMap())
      .filter(([key]) => key.substring(0, 2) !== '__' && key !== 'Query')
      .map(([key, value]) => ({ [key]: value }))
  );

  // handles all props that don't depend on fieldKinds, since recursion for arrays alter fieldKinds
  const getProps = ({ fieldDefinition, typeName, parentTypeName }) => {
    // use given typeName for initial call, or resolve typeName fron fieldDefinition
    typeName = typeName ? typeName : getTypeName(fieldDefinition);
    if (typeName === parentTypeName) throw new Error('recursive schemas are not supported');
    const typeDefinition = typeMap[typeName];
    const name = typeDefinition.name;
    const typeKinds = getKinds(typeDefinition);
    const fieldKinds = getKinds(fieldDefinition);
    const description = getDescription({ typeDefinition, fieldDefinition, typeKinds });
    const fields = typeDefinition.getFields && typeDefinition.getFields();
    return { typeName, fieldKinds, typeKinds, description, fields, name };
  };
  // converter function to reduce gql to json type definitions
  const resolveTypes = (props) => {
    const { typeName, fieldKinds, typeKinds, description, fields, name } = props;
    // get properties that depend on field types
    const constraints = getConstraints({ fieldKinds });
    const type = getType({ typeName, fieldKinds, typeKinds });
    // build schema object
    const jsonSchema = { type, ...constraints };
    // only set des ription, if it was given
    if (description) jsonSchema.description = description;
    // handle arrays
    if (jsonSchema.type === 'array') {
      // remove first types to handle nullability and type resolution correctly
      const itemFieldKinds = ['FieldDefinition', ...fieldKinds.slice(jsonSchema.nullable ? 2 : 3)];
      // recursively resolve arrays
      jsonSchema.items = resolveTypes({ ...props, fieldKinds: itemFieldKinds });
    }
    // handle objects
    if (jsonSchema.type === 'object') {
      // set type name for objects
      jsonSchema.name = name;
      // recursively resolve objects
      jsonSchema.properties = Object.assign(
        ...Object.entries(fields).map(([key, fieldDefinition]) => ({
          [key]: resolveTypes(getProps({ fieldDefinition, parentTypeName: typeName })),
        }))
      );
    }
    return jsonSchema;
  };
  // return nested json schema for base type
  return { title: baseType, ...resolveTypes(getProps({ typeName: baseType })) };
};
