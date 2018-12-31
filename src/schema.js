import * as consts from './consts';
import { getDirectives } from './directive';

export const getType = (field) => {
  return field.astNode.type.name;
};

export const filterByDirective = (name, fields) =>
  Object.keys(fields).reduce((filteredFields, fieldKey) => {
    const field = fields[fieldKey];
    if (field.astNode.directives) {
      if (field.astNode.directives.find((directive) => directive.name.value === name)) {
        return { ...filteredFields, [fieldKey]: fields[fieldKey] };
      }
    }
    return filteredFields;
  }, {});

export const convertDirectives = (type) => {
  switch (type.constructor.name) {
    case consts.GRAPHQL_ENUM_TYPE:
      if (type.astNode) {
        return getDirectives(type);
      }
      return {};

    case consts.OBJECT:
      if (type.astNode) {
        return getDirectives(type);
      }
      return {};

    case consts.GRAPHQL_OBJECT_TYPE:
      if (type.astNode) {
        return getDirectives(type);
      }
      return {};

    default:
      console.log('convertDirectives unhandled: ', type.constructor.name);
      return {};
  }
};

export const normalizeType = (type) => {
  const map = {
    String: 'string',
    Int: 'number',
    Float: 'float',
  };

  return map[type] ? map[type] : type;
};

export const convertField = (field) => {
  const getNonNullable = (field) => {
    if (field.astNode) {
      return field.astNode.type.kind !== consts.NON_NULL_TYPE;
    }
    return true;
  };

  const getIsList = (field) => {
    if (field.astNode) {
      if (field.astNode.type.kind === consts.LIST_TYPE) {
        return true;
      } else if (field.astNode.type.kind === consts.NON_NULL_TYPE) {
        if (field.astNode.type.type.kind === consts.LIST_TYPE) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    return false;
  };

  const getType = (field) => {
    if (field.astNode) {
      if (field.astNode.type.kind === consts.LIST_TYPE) {
        return field.astNode.type.type.name.value;
      } else if (field.astNode.type.kind === consts.NON_NULL_TYPE) {
        if (field.astNode.type.type.kind === consts.LIST_TYPE) {
          return field.astNode.type.type.type.name.value;
        } else {
          return field.astNode.type.type.name.value;
        }
      } else {
        return field.astNode.type.name.value;
      }
    }
    return field.type.toString;
  };

  switch (field.constructor.name) {
    case consts.OBJECT:
      return {
        type: getType(field),
        directives: convertDirectives(field),
        isNullable: getNonNullable(field),
        isList: getIsList(field),
      };
    default:
      console.log('convertField unhandled type: ', field.constructor.name);
      return {};
  }
};

export const convertFields = (fields) =>
  Object.keys(fields).reduce(
    (newFields, fieldKey) => ({
      ...newFields,
      [fieldKey]: convertField(fields[fieldKey]),
    }),
    {}
  );

export const convertObjectType = (type) => ({
  fields: convertFields(type.getFields()),
  directives: convertDirectives(type),
  type: consts.OBJECT,
  implements: type.getInterfaces().map((int) => int.name),
});

export const convertEnumType = (enumType) => ({
  fields: enumType.getValues().map((val) => val.name),
  directives: convertDirectives(enumType),
  type: consts.ENUM,
});

export const convertInterfaceType = (interfaceType) => ({
  fields: convertFields(interfaceType.getFields()),
  directives: convertDirectives(interfaceType),
  type: consts.INTERFACE,
  implements: [],
});

export const convertUnionType = (unionType) => ({
  name: unionType.name,
  types: unionType.types,
});

export const convertInputType = (inputType) => ({
  fields: convertFields(inputType.getFields()),
  directives: convertDirectives(inputType),
  type: consts.INPUT,
  implements: [],
});

export const convertTypeMap = (typeMap) => {
  const newTypeMap = {};
  Object.keys(typeMap).forEach((typeKey) => {
    switch (typeMap[typeKey].constructor.name) {
      case consts.GRAPHQL_ENUM_TYPE:
        newTypeMap[typeKey] = convertEnumType(typeMap[typeKey]);
        break;
      case consts.GRAPHQL_OBJECT_TYPE:
        newTypeMap[typeKey] = convertObjectType(typeMap[typeKey]);
        break;
      case consts.GRAPHQL_INTERFACE_TYPE:
        newTypeMap[typeKey] = convertInterfaceType(typeMap[typeKey]);
        break;
      case consts.GRAPHQL_INPUT_TYPE:
        newTypeMap[typeKey] = convertInputType(typeMap[typeKey]);
      case consts.GRAPHQL_UNION_TYPE:
        newTypeMap[typeKey] = convertUnionType(typeMap[typeKey]);
      default:
        console.log(typeMap[typeKey].constructor.name);
    }
  });
  return newTypeMap;
};

export const schemaToJS = (schema) => convertTypeMap(schema.getTypeMap());
