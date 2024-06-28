import { Type } from "./common";

export class Boolean extends Type<'boolean'> {
  constructor(public readonly defaultValue?: boolean) {
    super('boolean');
  }

  public toJSON() {
    return {
      ...super.toJSON(),
      default: this.defaultValue,
    }
  }
}