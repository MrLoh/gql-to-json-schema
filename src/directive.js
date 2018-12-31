import * as consts from './consts';

const kindEquals = (testKind) => ({ kind }) => kind === testKind;

const convertArgument = ({ kind, value, fields, values }) => {
  switch (kind) {
    case consts.INT_VALUE:
      return Number.parseInt(value, 10);
    case consts.FLOAT_VALUE:
      return Number.parseFloat(value);
    case consts.OBJECT_VALUE:
      return Object.assign(...fields.map(({ name, value }) => ({ [name.value]: value })));
    case consts.LIST_VALUE:
      return values.map((arg) => convertArgument(arg));
    case consts.STRING_VALUE:
    default:
      return value;
  }
};

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
