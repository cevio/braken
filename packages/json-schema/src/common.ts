import { JSONSchema, JSONSchemaTypes } from "./types";

export class Type<T extends JSONSchemaTypes> {
  private _description: string;
  private _title: string;
  public _required = false;
  private _deprecated = false;
  private _ref: string;

  constructor(private readonly _type: T) { }

  public toJSON(): JSONSchema<T> {
    return {
      type: this._ref ? undefined : this._type,
      title: this._title,
      description: this._description,
      deprecated: this._deprecated,
      $ref: this._ref,
    }
  }

  public title(value: string) {
    this._title = value;
    return this;
  }

  public description(value: string) {
    this._description = value;
    return this;
  }

  public required() {
    this._required = true;
    return this;
  }

  public deprecated() {
    this._deprecated = true;
    return this;
  }

  public ref(value: string) {
    this._ref = value;
    return this;
  }
}