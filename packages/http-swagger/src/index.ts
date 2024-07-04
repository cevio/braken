import { Parameter } from "./parameter";
import { SwaggerExternalDocs, SwaggerParameterInWhere, SwaggerProps, SwaggerSecurity, SwaggerServer, SwaggerTag } from "./types";
import t, { JSONSchema, JSONSchemaObject, JSONSchemaTypes } from '@braken/json-schema';
import { glob } from 'glob';
import { resolve } from 'node:path';
import { Controller, getMetaByController, getMethodsByController, hasDeprecatedController } from '@braken/http';
import { IClass } from "@braken/injection";

export default class Swagger<G extends Record<string, string> = {}> {
  private readonly _tags: SwaggerTag[] = [];
  private readonly _parameters = new Map<Function, Parameter[]>();
  private readonly _contentTypes = new Map<Function, Set<string>>();
  private readonly _responseTypes = new Map<Function, Set<string>>();
  private readonly _responses = new Map<Function, Map<number, JSONSchemaObject>>();
  private readonly _controllers = new Map<Function, { summary: string, description: string, tags: (keyof G)[] }>();
  private readonly _definitions = new Map<string, JSONSchemaObject>();

  public openapi: SwaggerProps['openapi'];
  public info: SwaggerProps['info'];
  public jsonSchemaDialect: SwaggerProps['jsonSchemaDialect'];
  public basePath: string = '/';
  public version: string = '2.0';
  public servers: SwaggerServer[] = [];
  public security: SwaggerSecurity;
  public externalDocs: SwaggerExternalDocs;

  constructor(options: G) {
    for (const key in options) {
      this._tags.push({
        name: key,
        description: options[key],
      })
    }
  }

  public Parameter<T extends JSONSchemaObject>(name: string, inwhere: SwaggerParameterInWhere, value: T): ClassDecorator {
    return target => {
      if (!this._parameters.has(target)) {
        this._parameters.set(target, []);
      }
      const current = this._parameters.get(target);
      const parameter = new Parameter(name, inwhere, value);
      current.push(parameter);
    }
  }

  public ContentType(...args: string[]): ClassDecorator {
    return target => {
      if (!this._contentTypes.has(Function)) {
        this._contentTypes.set(target, new Set());
      }
      const current = this._contentTypes.get(target);
      for (let i = 0; i < args.length; i++) {
        current.add(args[i]);
      }
    }
  }

  public ResponseType(...args: string[]): ClassDecorator {
    return target => {
      if (!this._responseTypes.has(Function)) {
        this._responseTypes.set(target, new Set());
      }
      const current = this._responseTypes.get(target);
      for (let i = 0; i < args.length; i++) {
        current.add(args[i]);
      }
    }
  }

  public Response<T extends JSONSchemaObject>(code: number, value: T): ClassDecorator {
    return target => {
      if (!this._responses.has(target)) {
        this._responses.set(target, new Map())
      }
      const current = this._responses.get(target);
      current.set(code, value);
    }
  }

  public Controller(summary: string, description: string, ...args: (keyof G)[]): ClassDecorator {
    return target => {
      if (!this._controllers.has(target)) {
        this._controllers.set(target, {
          summary: null,
          description: null,
          tags: []
        })
      }
      const current = this._controllers.get(target);
      current.summary = summary;
      current.description = description;
      current.tags = args;
    }
  }

  public addDefinition(name: string, value: JSONSchemaObject) {
    this._definitions.set(name, value);
    return this;
  }

  public async autoLoadDefinitons(directory: string) {
    const files = await glob(`*.def.{ts,js}`, { cwd: directory });
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = file.substring(0, file.length - 7);
      const object = (await import(resolve(directory, file))).default as JSONSchemaObject;
      this.addDefinition(path, object);
    }
    return this;
  }

  public ref(value: string) {
    return t.Ref('#/definitions/' + value);
  }

  public toJSON() {
    const definitions: Record<string, JSONSchema<JSONSchemaTypes>> = {};
    for (const [key, schema] of this._definitions.entries()) {
      definitions[key] = schema.toJSON();
    }
    const paths: Record<string, Record<string, {
      deprecated?: boolean,
      summary?: string,
      tags?: (keyof G)[],
      description?: string,
      consumes?: string[],
      produces?: string[],
      parameters?: ReturnType<Parameter['toJSON']>[],
      responses?: Record<string, {
        description?: string,
        schema: JSONSchema<JSONSchemaTypes>,
      }>
    }>> = {}
    for (const [controller, { summary, description, tags }] of this._controllers.entries()) {
      const deprecated = hasDeprecatedController(controller as IClass<Controller>);
      const methods = getMethodsByController(controller as IClass<Controller>);
      const [{ path }] = getMetaByController(controller as IClass<Controller>);
      const url = path.replace(/\[([^\]]+)\]/g, '{$1}');

      const consumes = this._contentTypes.has(controller)
        ? Array.from(this._contentTypes.get(controller).values())
        : undefined;

      const produces = this._responseTypes.has(controller)
        ? Array.from(this._responseTypes.get(controller).values())
        : undefined;

      const responses: Record<string, {
        description?: string,
        schema: JSONSchema<JSONSchemaTypes>,
      }> = {};

      if (this._responses.has(controller)) {
        const responser = this._responses.get(controller);
        for (const [code, schema] of responser.entries()) {
          const data = schema.toJSON();
          responses[code + ''] = {
            description: data.description,
            schema: data,
          }
        }
      }

      const parameters = this._parameters.has(controller)
        ? this._parameters.get(controller).map(paramer => paramer.toJSON())
        : []

      if (!paths[url]) paths[url] = {};
      for (const method of methods.values()) {
        if (!paths[url][method]) paths[url][method] = {}
        paths[url][method].deprecated = deprecated;
        paths[url][method].summary = summary;
        paths[url][method].description = description;
        paths[url][method].consumes = consumes;
        paths[url][method].produces = produces;
        paths[url][method].responses = responses;
        paths[url][method].tags = tags;
        paths[url][method].parameters = parameters;
      }
    }
    return {
      openapi: this.openapi,
      swagger: this.version,
      info: this.info,
      jsonSchemaDialect: this.jsonSchemaDialect,
      servers: this.servers.length ? this.servers : undefined,
      tags: this._tags,
      externalDocs: this.externalDocs,
      security: this.security,
      definitions, paths,
    }
  }
}