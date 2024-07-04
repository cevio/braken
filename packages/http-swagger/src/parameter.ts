import { JSONSchemaObject } from "@braken/json-schema";
import { SwaggerParameterInWhere } from "./types";

export class Parameter {
  constructor(
    private readonly name: string,
    private readonly inwhere: SwaggerParameterInWhere,
    private readonly value: JSONSchemaObject
  ) { }

  public toJSON() {
    const val = this.value.toJSON();
    return {
      in: this.inwhere,
      name: this.name,
      schema: val,
      required: this.value._required,
    }
  }
}