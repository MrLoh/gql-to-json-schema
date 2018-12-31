/// <reference path="../index.d.ts"/>
import * as graphql from "graphql/type";
import * as consts from "./consts";
import { always, cond, equals, map, pipe, prop, reduce, T } from "ramda";

/** @type {function(string): function(GraphQLArgumentValue): boolean} */
export const kindEquals = kind =>
  pipe(
    prop("kind"),
    equals(kind)
  );

export const convertArgument = cond([
  [kindEquals(consts.STRING_VALUE), prop("value")],
  [
    kindEquals(consts.INT_VALUE),
    pipe(
      prop("value"),
      parseInt
    )
  ],
  [
    kindEquals(consts.FLOAT_VALUE),
    pipe(
      prop("value"),
      parseFloat
    )
  ],
  [
    kindEquals(consts.OBJECT_VALUE),
    pipe(
      prop("fields"),
      reduce(
        (fields, field) => ({
          ...fields,
          [field.name.value]: convertArgument(field.value)
        }),
        {}
      )
    )
  ],
  [
    kindEquals(consts.LIST_VALUE),
    pipe(
      prop("values"),
      map(arg => convertArgument(arg))
    )
  ],
  [T, always(prop("value"))]
]);

/** @type {function(GraphQLArgument[]): {[key: string]: Argument}} */
export const convertArguments = reduce(
  (args, arg) => ({ ...args, [arg.name.value]: convertArgument(arg.value) }),
  {}
);
/**
 *
 * @param {graphql.GraphQLNamedType | graphql.GraphQLField | graphql.GraphQLEnumType} type
 */
export const getDirectives = type => {
  const directives = type.astNode.directives;
  return directives.reduce(
    (dirs, directive) => ({
      ...dirs,
      directivesKeys: directives,
      [directive.name.value]: directive.arguments.reduce(
        (args, arg) => ({
          ...args,
          [arg.name.value]: convertArgument(arg.value)
        }),
        {}
      )
    }),
    {}
  );
};

export const directiveReducer = (dirs, directive) => ({
  ...dirs,
  [directive.name.value]: convertArguments(directive.arguments)
});
