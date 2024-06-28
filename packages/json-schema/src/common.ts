import { JSONSchema, JSONSchemaTypes } from "./types";

export class Type<T extends JSONSchemaTypes> {
  private _description: string;
  private _title: string;
  public _required = false;
  private _deprecated = false;

  constructor(private readonly _type: T) { }

  public toJSON(): JSONSchema<T> {
    return {
      type: this._type,
      title: this._title,
      description: this._description,
      deprecated: this._deprecated,
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
}