type GraphQLType = {
    astNode?: {
        directives?: GraphQLDirective[]
    }
}
type GraphQLDirective = {
    name: {
        value: string;
    };
    arguments?: GraphQLArgument[]
}

type GraphQLArgumentValue = {
    kind: string;
    value?: any;
    fields?: GraphQLArgument[];
    values?: GraphQLArgumentValue[];
}

type GraphQLArgument = {
    name: {
        value: string;
    };
    value: GraphQLArgumentValue;
}

type Argument = {
    name: string;
    value: string | number | Argument | Argument[];
}

type Directive = {
    name: string;
    arguments: Argument[];
}

type Field = {
    type?: string;
    directives?: {
        [key: string]: Directive;
    }
    isList?: boolean;
    isNullable?: boolean;
}

type Enum = {
    fields: string[];
    type: string;
    directives?: {
        [key: string]: Directive
    };
}

type Type = {
    fields: {
        [key: string]: Field
    };
    directives: {
        [key: string]: Directive
    };
    type: string;
    implements: string[];
}

type Types = {
    [key: string]: Types
}

type Schema = {
    types: Types
}

type JSSchema = {
    [key: string]: Type | Enum
}

declare function schemaToJS(schema: any) : JSSchema

declare namespace consts {
    const ENUM: string
    const GRAPHQL_LIST: string
    const GRAPHQL_NON_NULL: string
    const GRAPHQL_OBJECT_TYPE: string
    const GRAPHQL_SCALAR_TYPE: string
    const GRAPHQL_ENUM_TYPE: string
    const LIST_TYPE: string
    const NON_NULL_TYPE: string
    const OBJECT: string
}