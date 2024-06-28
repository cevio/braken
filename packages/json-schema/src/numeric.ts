import { Type } from "./common";

export class Integer extends Type<'integer'> {
  private readonly _range: [number, number] = [0, 0];
  private _exclusiveMaximum: number | boolean;
  private _multipleOf: number;
  private _enum: number[] = [];
  constructor(public readonly defaultValue?: number) {
    super('integer');
  }

  public range(min: number, max: number, exclusiveMaximum?: number | boolean) {
    if (min) this._range[0] = min;
    if (max) this._range[1] = max;
    this._exclusiveMaximum = exclusiveMaximum;
    return this;
  }

  public multipleOf(i: number) {
    this._multipleOf = i;
    return this;
  }

  public toJSON() {
    return {
      ...super.toJSON(),
      default: this.defaultValue,
      minimum: this._range[0] !== 0 ? this._range[0] : undefined,
      maximum: this._range[1] !== 0 ? this._range[1] : undefined,
      exclusiveMaximum: this._exclusiveMaximum,
      multipleOf: this._multipleOf,
      enum: this._enum.length ? this._enum : undefined,
    }
  }
}

export class Number extends Type<'number'> {
  private readonly _range: [number, number] = [0, 0];
  private _exclusiveMaximum: number | boolean;
  private _multipleOf: number;
  private _enum: number[] = [];
  constructor(public readonly defaultValue?: number) {
    super('number');
  }

  public range(min: number, max: number, exclusiveMaximum?: number | boolean) {
    if (min) this._range[0] = min;
    if (max) this._range[1] = max;
    this._exclusiveMaximum = exclusiveMaximum;
    return this;
  }

  public multipleOf(i: number) {
    this._multipleOf = i;
    return this;
  }

  public toJSON() {
    return {
      ...super.toJSON(),
      default: this.defaultValue,
      minimum: this._range[0] !== 0 ? this._range[0] : undefined,
      maximum: this._range[1] !== 0 ? this._range[1] : undefined,
      exclusiveMaximum: this._exclusiveMaximum,
      multipleOf: this._multipleOf,
      enum: this._enum.length ? this._enum : undefined,
    }
  }
}