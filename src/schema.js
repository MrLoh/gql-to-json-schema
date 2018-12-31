/// <reference path="../index.d.ts"/>

import * as consts from "./consts";
import * as graphql from "graphql/type";
import { getDirectives } from "./directive";

export const getType = field => {
  return field.astNode.type.name;
};

export const filterByDirective = (name, fields) =>
  Object.keys(fields).reduce((filteredFields, fieldKey) => {
    const field = fields[fieldKey];
    if (field.astNode.directives) {
      if (
        field.astNode.directives.find(
          directive => directive.name.value === name
        )
      ) {
        return { ...filteredFields, [fieldKey]: fields[fieldKey] };
      }
    }
    return filteredFields;
  }, {});

/**
 *
 * @param {graphql.GraphQLNamedType | graphql.GraphQLField | graphql.GraphQLEnumType} type
 * @return {Object.<string, Directive>}
 */
export const convertDirectives = type => {
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
      console.log("convertDirectives unhandled: ", type.constructor.name);
      return {};
  }
};

export const normalizeType = type => {
  const map = {
    String: "string",
    Int: "number",
    Float: "float"
  };

  return map[type] ? map[type] : type;
};
/**
 * @param {graphql.GraphQLField<any, any>} field
 * @return {Field}
 */
export const convertField = field => {
  const getNonNullable = field => {
    if (field.astNode) {
      return field.astNode.type.kind !== consts.NON_NULL_TYPE;
    }
    return true;
  };

  const getIsList = field => {
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
  /**
   * @param {graphql.GraphQLField} field
   */
  const getType = field => {
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
        isList: getIsList(field)
      };
    default:
      console.log("convertField unhandled type: ", field.constructor.name);
      return {};
  }
};
/**
 * @param {Object.<string, graphql.GraphQLField>} fields
 * @return {Object.<string, Field>}
 */
export const convertFields = fields =>
  Object.keys(fields).reduce(
    (newFields, fieldKey) => ({
      ...newFields,
      [fieldKey]: convertField(fields[fieldKey])
    }),
    {}
  );
/**
 * @function
 * @param {graphql.GraphQLObjectType} type
 * @return {Type}
 */
export const convertObjectType = type => ({
  fields: convertFields(type.getFields()),
  directives: convertDirectives(type),
  type: consts.OBJECT,
  implements: type.getInterfaces().map(int => int.name)
});
/**
 * @function
 * @param {graphql.GraphQLEnumType} enumType
 * @returns {Enum}
 */
export const convertEnumType = enumType => ({
  fields: enumType.getValues().map(val => val.name),
  directives: convertDirectives(enumType),
  type: consts.ENUM
});

/**
 * @function
 * @param {graphql.GraphQLInterfaceType} interfaceType
 * @returns {Type}
 */
export const convertInterfaceType = interfaceType => ({
  fields: convertFields(interfaceType.getFields()),
  directives: convertDirectives(interfaceType),
  type: consts.INTERFACE,
  implements: []
});
/**
 *
 * @param {graphql.GraphQLUnionType} unionType
 * @returns {Type}
 */
export const convertUnionType = unionType => ({
  name: unionType.name,
  types: unionType.types
});
/**
 *
 * @param {graphql.GraphQLInputObjectType} inputType
 * @returns {Type}
 */
export const convertInputType = inputType => ({
  fields: convertFields(inputType.getFields()),
  directives: convertDirectives(inputType),
  type: consts.INPUT,
  implements: []
});
/**
 * @function
 * @param {Object.<string, graphql.GraphQLNamedType>} typeMap
 * @returns {Object.<string, Type | Enum>}
 */
export const convertTypeMap = typeMap => {
  const newTypeMap = {};

  Object.keys(typeMap).forEach(typeKey => {
    switch (typeMap[typeKey].constructor.name) {
      case consts.GRAPHQL_ENUM_TYPE:
        newTypeMap[typeKey] = convertEnumType(
          /** @type {graphql.GraphQLEnumType} */ (typeMap[typeKey])
        );
        break;
      case consts.GRAPHQL_OBJECT_TYPE:
        newTypeMap[typeKey] = convertObjectType(
          /** @type {graphql.GraphQLObjectType} */ (typeMap[typeKey])
        );
        break;
      case consts.GRAPHQL_INTERFACE_TYPE:
        newTypeMap[typeKey] = convertInterfaceType(
          /** @type {graphql.GraphQLInterfaceType} */ (typeMap[typeKey])
        );
        break;
      case consts.GRAPHQL_INPUT_TYPE:
        newTypeMap[typeKey] = convertInputType(
          /** @type {graphql.GraphQLInputObjectType} */ (typeMap[typeKey])
        );
      case consts.GRAPHQL_UNION_TYPE:
        newTypeMap[typeKey] = convertUnionType(
          /** @type {graphql.GraphQLUnionType} */ (typeMap[typeKey])
        );
      default:
        console.log(typeMap[typeKey].constructor.name);
    }
  });
  return newTypeMap;
};
/**
 * @param {graphql.GraphQLSchema} schema
 * @returns {JSSchema}
 */
export const schemaToJS = schema => convertTypeMap(schema.getTypeMap());
