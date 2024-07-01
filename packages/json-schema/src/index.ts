import { String } from './string';
import { Integer, Number } from './numeric';
import { Boolean } from './boolean';
import { Null } from './null';
import { Type } from './common';
import { JSONSchemaTypes } from './types';
import { Object } from './object';
import { Array } from './array';
import { Ref } from './ref';

export default {
  String: (value?: string) => new String(value),
  Integer: (value?: number) => new Integer(value),
  Number: (value?: number) => new Number(value),
  Boolean: (value?: boolean) => new Boolean(value),
  Null: () => new Null(),
  Object: (value: Record<string, Type<JSONSchemaTypes>>) => new Object(value),
  Array: (value: Type<JSONSchemaTypes> | Type<JSONSchemaTypes>[]) => new Array(value),
  Ref: (value: string) => new Ref(value),
}