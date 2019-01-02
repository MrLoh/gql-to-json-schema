import { buildSchema } from 'graphql';
import { kebabCase } from 'lodash';

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

const SCALAR = 'ScalarTypeDefinition';
const ENUM = 'EnumTypeDefinition';
const DEFAULT = 'DefaultTypeDefinition';
const OBJECT = 'ObjectTypeDefinition';
const LIST = 'ListType';

const JSON_FORMAT_TYPES = ['DateTime', 'Date', 'Time', 'Email', 'Url'];

export const libraryScalars = JSON_FORMAT_TYPES.map((type) => `scalar ${type}`).join('\n');
const mockQuery = 'type Query { pass: Int }';

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
    return [SCALAR, DEFAULT];
  }
};

const parseArg = (arg) => {
  switch (arg.kind) {
    case 'IntValue':
      return Number.parseInt(arg.value, 10);
    case 'FloatValue':
      return Number.parseFloat(arg.value);
    case 'ObjectValue':
      return Object.assign(...arg.fields.map(({ name, value }) => ({ [name.value]: value })));
    case 'ListValue':
      return arg.values.map((argItem) => parseArg(argItem));
    case 'StringValue':
    default:
      return arg.value;
  }
};

const getDirectives = (def) => {
  if (def && def.astNode) {
    return def.astNode.directives.map((directive) => ({
      name: directive.name.value,
      args: Object.assign(
        ...directive.arguments.map((arg) => ({ [arg.name.value]: parseArg(arg.value) }))
      ),
    }));
  } else return [];
};

const getType = ({ typeName, fieldKinds, typeKinds }) => {
  if (fieldKinds.includes(LIST)) {
    return 'array';
  } else if ([...typeKinds, ...fieldKinds].includes(OBJECT)) {
    return 'object';
  } else if (typeKinds.includes(ENUM)) {
    return 'enum';
  } else if (typeKinds.includes(DEFAULT)) {
    return { String: 'string', Boolean: 'boolean', Int: 'integer', Float: 'number' }[typeName];
  } else if (typeKinds.includes(SCALAR)) {
    return 'string';
  } else {
    throw new Error('unhandled type case');
  }
};

const getConstraints = ({ fieldKinds, typeKinds, typeName, directives }) => {
  const constraints = {};
  // set nullability for field
  if (fieldKinds.length > 0) {
    constraints.nullable = fieldKinds[1] !== 'NonNullType';
  }
  // set format for predefined scalar types
  if (typeKinds.includes(SCALAR) && JSON_FORMAT_TYPES.includes(typeName)) {
    constraints.format = kebabCase(typeName);
  }
  // handle directives
  if (directives.length > 0) {
    // assign directives as constraints
    directives.forEach(({ name, args }) => {
      // if directtive has single argument named `_` then resolve if directly
      const hasSingleUnderscoreArg = Object.keys(args).length === 1 && Object.keys(args)[0] === '_';
      constraints[name] = hasSingleUnderscoreArg ? args['_'] : args;
    });
  }
  return constraints;
};

const getFields = (typeDefinition) => typeDefinition.getFields && typeDefinition.getFields();

const getValues = (typeDefinition) =>
  typeDefinition.getValues &&
  typeDefinition.getValues().map(({ description, name, value }) => ({ description, name, value }));

const getDescription = ({ typeDefinition, fieldDefinition, typeKinds }) => {
  if (fieldDefinition && fieldDefinition.description) return fieldDefinition.description;
  if (!typeKinds.includes(DEFAULT) && typeDefinition.description) return typeDefinition.description;
};

export const gql2jsonSchema = (typeDefs, baseType, { noQuery, noDefaultScalars } = {}) => {
  // if not specified, infer first type to be the base type
  if (!baseType) baseType = typeDefs.match(/\s*type\s*(\w*)/)[1];
  // build gql schema object from type defs and get map of relevant types
  const gqlSchema = buildSchema(
    typeDefs + (noQuery ? '' : mockQuery) + (noDefaultScalars ? '' : libraryScalars)
  );
  const typeMap = Object.assign(
    ...Object.entries(gqlSchema.getTypeMap())
      .filter(([key]) => key.substring(0, 2) !== '__' && key !== 'Query')
      .map(([key, value]) => ({ [key]: value }))
  );
  // const directiveMap = Object.assign(
  //   ...gqlSchema.getDirectives().map((directive) => ({ [directive.name]: directive }))
  // );

  // handles all props that don't depend on fieldKinds, since recursion for arrays alter fieldKinds
  const getProps = ({ fieldDefinition, typeName, parentTypeName }) => {
    // use given typeName for initial call, or resolve typeName fron fieldDefinition
    typeName = typeName ? typeName : getTypeName(fieldDefinition);
    if (typeName === parentTypeName) throw new Error('recursive schemas are not supported');
    const typeDefinition = typeMap[typeName];
    const typeKinds = getKinds(typeDefinition);
    const fieldKinds = getKinds(fieldDefinition);
    const directives = getDirectives(fieldDefinition);
    const description = getDescription({ typeDefinition, fieldDefinition, typeKinds });
    const fields = getFields(typeDefinition);
    const values = getValues(typeDefinition);
    return { typeName, fieldKinds, typeKinds, description, fields, values, directives };
  };

  // converter function to reduce gql to json type definitions
  const resolveTypes = (props) => {
    const { typeName, fieldKinds, typeKinds, directives } = props;
    // get properties that depend on field types
    const constraints = getConstraints({ fieldKinds, typeKinds, typeName, directives });
    const type = getType({ typeName, fieldKinds, typeKinds });
    // build schema object
    const jsonSchema = { type, ...constraints };
    // only set des ription, if it was given
    if (props.description) jsonSchema.description = props.description;
    // set type name for objects, enums, and custom scalars
    if (
      (!typeKinds.includes(DEFAULT) && typeKinds.includes(SCALAR)) ||
      ['enum', 'object'].includes(type)
    ) {
      jsonSchema.name = typeName;
    }
    // handle enums
    if (type === 'enum') {
      jsonSchema.type = 'string';
      jsonSchema.enum = props.values;
    }
    // handle lists
    if (type === 'array') {
      // remove first types to handle nullability and type resolution correctly
      const itemFieldKinds = ['FieldDefinition', ...fieldKinds.slice(jsonSchema.nullable ? 2 : 3)];
      // recursively resolve arrays
      jsonSchema.items = resolveTypes({ ...props, fieldKinds: itemFieldKinds });
    }
    // handle referenced types
    if (type === 'object') {
      // recursively resolve objects
      jsonSchema.properties = Object.assign(
        ...Object.entries(props.fields).map(([key, fieldDefinition]) => ({
          [key]: resolveTypes(getProps({ fieldDefinition, parentTypeName: typeName })),
        }))
      );
      // set non nullable properties as required
      jsonSchema.required = Object.keys(jsonSchema.properties).filter(
        (key) => !jsonSchema.properties[key].nullable
      );
    }
    return jsonSchema;
  };

  // return nested json schema for base type
  return { title: baseType, ...resolveTypes(getProps({ typeName: baseType })) };
};

export const gql = (strings, ...values) =>
  strings.reduce((result, str, i) => result + str + (values[i] || ''));
