import { Type } from "./common";

export class Null extends Type<'null'> {
  constructor() {
    super('null');
  }

  public toJSON() {
    return {
      ...super.toJSON(),
    }
  }
}