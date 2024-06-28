import { Type } from "./common";
import { JSONSchemaTypes } from "./types";

const ARRAY = globalThis.Array;

export class Array extends Type<'array'> {
  private _prefixItems: Type<JSONSchemaTypes>[] = [];
  private _items: Type<JSONSchemaTypes>;
  private _unevaluatedItems = true;
  private _uniqueItems = false;
  private _contains: Type<JSONSchemaTypes>;
  private readonly _range: [number, number] = [0, 0];
  private readonly _containsRange: [number, number] = [0, 0];

  constructor(data: Type<JSONSchemaTypes> | Type<JSONSchemaTypes>[]) {
    super('array');
    if (ARRAY.isArray(data)) {
      this.prefixItems(data);
    } else {
      this.items(data);
    }
  }

  public prefixItems(args: Type<JSONSchemaTypes>[] = []) {
    this._prefixItems = args;
    return this;
  }

  public items(value: Type<JSONSchemaTypes>) {
    this._items = value;
    return this;
  }

  // https://json-schema.org/understanding-json-schema/reference/array#unevaluateditems
  public unevaluatedItems() {
    this._unevaluatedItems = false;
    return this;
  }

  public range(min: number, max: number) {
    if (min) this._range[0] = min;
    if (max) this._range[1] = max;
    return this;
  }

  public unique() {
    this._uniqueItems = true;
    return this;
  }

  // https://json-schema.org/understanding-json-schema/reference/array#contains
  public contains(value: Type<JSONSchemaTypes>) {
    this._contains = value;
    return this;
  }

  // https://json-schema.org/understanding-json-schema/reference/array#mincontains-maxcontains
  public containsRange(min: number, max: number) {
    if (min) this._containsRange[0] = min;
    if (max) this._containsRange[1] = max;
    return this;
  }

  public toJSON() {
    const prefixItems = this._prefixItems.length
      ? this._prefixItems.map(item => item.toJSON())
      : undefined;
    const items = this._items
      ? this._items.toJSON()
      : false;

    const defaultValue: any[] = prefixItems
      ? prefixItems.map(item => item.default)
      : items
        ? items.default
        : [];

    return {
      ...super.toJSON(),
      default: defaultValue,
      prefixItems: prefixItems,
      items,
      unevaluatedItems: this._unevaluatedItems,
      minItems: this._range[0] !== 0 ? this._range[0] : undefined,
      maxItems: this._range[1] !== 0 ? this._range[1] : undefined,
      uniqueItems: this._uniqueItems,
      contains: this._contains,
      minContains: this._containsRange[0] !== 0 ? this._containsRange[0] : undefined,
      maxContains: this._containsRange[1] !== 0 ? this._containsRange[1] : undefined,
    }
  }
}