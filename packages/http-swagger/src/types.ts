export interface SwaggerContact {
  name: string,
  url: string,
  email: string,
}

export interface SwaggerLicense {
  name: string,
  identifier: string,
  url: string,
}

export interface SwaggerServer {
  url: string,
  description?: string,
  variables?: string | {
    enum?: string[],
    default: string,
    description?: string,
  }
}

export interface SwaggerInfo {
  title: string,
  version: string,
  summary?: string,
  description?: string,
  termsOfService?: string,
  contact?: SwaggerContact,
  license?: SwaggerLicense,
}

export type SwaggerSecurity = Record<string, string[]>;

export interface SwaggerTag {
  name: string,
  description?: string,
  externalDocs?: SwaggerExternalDocs,
}

export interface SwaggerExternalDocs {
  description?: string,
  url: string,
}

export interface SwaggerProps {
  openapi?: string,
  swagger?: string,
  info: SwaggerInfo,
  jsonSchemaDialect?: string,
  servers?: SwaggerServer[],
  security?: SwaggerSecurity,
  tags?: SwaggerTag[],
  externalDocs?: SwaggerExternalDocs,
}

export type SwaggerParameterInWhere = "query" // 表示参数是从查询字符串中获取的，通常出现在 URL 中，例如 ?key=value。
  | "header" // 表示参数是从请求标头中获取的，通常包含在 HTTP 请求的头部信息中。
  | "path" // 表示参数是从 URL 路径中提取的，通常用于 RESTful API 中的路由参数。
  | "cookie" // 表示参数是从请求的 Cookie 中获取的。
  | "formData" // 通常用于 H // 表示参数是请求体的一部分，通常包含 JSON 或 XML 数据。这通常与 POST、PUT、PATCH 等请求一起使用。
  | "body";