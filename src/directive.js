import * as consts from './consts';
import { always, cond, equals, map, pipe, prop, reduce, T } from 'ramda';

export const kindEquals = (kind) =>
  pipe(
    prop('kind'),
    equals(kind)
  );

export const convertArgument = cond([
  [kindEquals(consts.STRING_VALUE), prop('value')],
  [
    kindEquals(consts.INT_VALUE),
    pipe(
      prop('value'),
      parseInt
    ),
  ],
  [
    kindEquals(consts.FLOAT_VALUE),
    pipe(
      prop('value'),
      parseFloat
    ),
  ],
  [
    kindEquals(consts.OBJECT_VALUE),
    pipe(
      prop('fields'),
      reduce(
        (fields, field) => ({
          ...fields,
          [field.name.value]: convertArgument(field.value),
        }),
        {}
      )
    ),
  ],
  [
    kindEquals(consts.LIST_VALUE),
    pipe(
      prop('values'),
      map((arg) => convertArgument(arg))
    ),
  ],
  [T, always(prop('value'))],
]);

export const convertArguments = reduce(
  (args, arg) => ({ ...args, [arg.name.value]: convertArgument(arg.value) }),
  {}
);

export const getDirectives = (type) => {
  const directives = type.astNode.directives;
  return directives.reduce(
    (dirs, directive) => ({
      ...dirs,
      directivesKeys: directives,
      [directive.name.value]: directive.arguments.reduce(
        (args, arg) => ({
          ...args,
          [arg.name.value]: convertArgument(arg.value),
        }),
        {}
      ),
    }),
    {}
  );
};

export const directiveReducer = (dirs, directive) => ({
  ...dirs,
  [directive.name.value]: convertArguments(directive.arguments),
});
