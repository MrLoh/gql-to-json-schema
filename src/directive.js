const kindEquals = (testKind) => ({ kind }) => kind === testKind;

export const FLOAT_VALUE = 'FloatValue';
export const INT_VALUE = 'IntValue';
export const LIST_VALUE = 'ListValue';
export const OBJECT_VALUE = 'ObjectValue';
export const STRING_VALUE = 'StringValue';

const parseArg = (arg) =>
  ({
    IntValue: Number.parseInt(arg.value, 10),
    FloatValue: Number.parseFloat(arg.value),
    ObjectValue: Object.assign(...arg.fields.map((field) => ({ [field.name.value]: field.value }))),
    ListValue: arg.values.map((argItem) => parseArg(argItem)),
    StringValue: arg.value,
  }[arg.kind]);

export const getDirectives = (type) => {
  return Object.assign(
    ...type.astNode.directives.map((directive) => ({
      [directive.name.value]: Object.assign(
        ...directive.arguments.map((arg) => ({ [arg.name.value]: parseArg(arg.value) }))
      ),
    }))
  );
};
