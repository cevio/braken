import { Type } from "./common";
import { JSONSchemaFormat } from "./types";

export class String extends Type<'string'> {
  private readonly _length: [number, number] = [0, 0];
  private _pattern: string;
  private _format: JSONSchemaFormat;
  private _enum: string[] = [];
  constructor(public readonly defaultValue?: string) {
    super('string');
  }

  public length(min: number, max: number) {
    if (min) this._length[0] = min;
    if (max) this._length[1] = max;
    return this;
  }

  public pattern(value: string | RegExp) {
    if (typeof value === 'string') {
      this._pattern = value;
    } else {
      this._pattern = value.source;
    }
    return this;
  }

  public format(value: JSONSchemaFormat) {
    this._format = value;
    return this;
  }

  public enum(...args: string[]) {
    this._enum = args;
    return this;
  }

  public toJSON() {
    return {
      ...super.toJSON(),
      default: this.defaultValue,
      minLength: this._length[0] !== 0 ? this._length[0] : undefined,
      maxLength: this._length[1] !== 0 ? this._length[1] : undefined,
      pattern: this._pattern,
      format: this._format,
      enum: this._enum.length ? this._enum : undefined,
    }
  }
}