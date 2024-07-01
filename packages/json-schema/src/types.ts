export interface JSONSchema<T extends JSONSchemaTypes> {
  type: T,
  default?: any,
  description?: string,
  title?: string,
  deprecated: boolean,
  $ref?: string,
}

export type JSONSchemaTypes = 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean' | 'null';
export type JSONSchemaFormat = 'date-time' | 'time' | 'date' | 'duration' | 'email' | 'idn-email' | 'hostname' | 'idn-hostname' | 'ipv4' | 'ipv6' | 'uuid' | 'uri' | 'uri-reference' | 'iri' | 'iri-reference' | 'uri-template' | 'json-pointer' | 'regex'