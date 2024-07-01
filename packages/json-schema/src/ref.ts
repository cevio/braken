import { Type } from "./common";

export class Ref extends Type<'null'> {
  constructor(defaultValue: string) {
    super('null');
    this.ref(defaultValue);
  }
}