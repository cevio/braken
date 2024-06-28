import { Type } from "./common";
import { JSONSchema, JSONSchemaTypes } from "./types";

const OBJECT = globalThis.Object;

export class Object extends Type<'object'> {
  private _additionalProperties = true;
  private _unevaluatedProperties = true;
  private readonly _data: Record<string, Type<JSONSchemaTypes>> = {}
  private readonly _range: [number, number] = [0, 0];
  constructor(data: Record<string, Type<JSONSchemaTypes>> = {}) {
    super('object');
    for (const key in data) {
      this.set(key, data[key]);
    }
  }

  public set<K extends JSONSchemaTypes, T extends Type<K>>(key: string, value: T) {
    this._data[key] = value;
    return this;
  }

  public range(min: number, max: number) {
    if (min) this._range[0] = min;
    if (max) this._range[1] = max;
    return this;
  }

  // 定义对象是否允许包含 Schema 中未定义的属性。
  public additionalProperties() {
    this._additionalProperties = false;
    return this;
  }

  public unevaluatedProperties() {
    this._unevaluatedProperties = false;
    return this;
  }

  public toJSON() {
    const keys = OBJECT.keys(this._data);
    const properties: Record<string, JSONSchema<JSONSchemaTypes>> = {};
    const value: Record<string, any> = {};
    const required: string[] = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const val = this._data[key];
      properties[key] = val.toJSON();
      value[key] = properties[key].default;
      if (val._required) {
        required.push(key);
      }
    }
    return {
      ...super.toJSON(),
      default: value,
      properties,
      additionalProperties: this._additionalProperties,
      unevaluatedProperties: this._unevaluatedProperties,
      required: required,
      minProperties: this._range[0] !== 0 ? this._range[0] : undefined,
      maxProperties: this._range[1] !== 0 ? this._range[1] : undefined,
    }
  }
}