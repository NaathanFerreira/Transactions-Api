'use strict'
const __defProp = Object.defineProperty
const __getOwnPropDesc = Object.getOwnPropertyDescriptor
const __getOwnPropNames = Object.getOwnPropertyNames
const __hasOwnProp = Object.prototype.hasOwnProperty
const __export = (target, all) => {
  for (const name in all)
    __defProp(target, name, { get: all[name], enumerable: true })
}
const __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === 'object') || typeof from === 'function') {
    for (const key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        })
  }
  return to
}
const __toCommonJS = (mod) =>
  __copyProps(__defProp({}, '__esModule', { value: true }), mod)

// src/database.ts
const database_exports = {}
__export(database_exports, {
  config: () => config2,
  knex: () => knex,
})
module.exports = __toCommonJS(database_exports)
const import_knex = require('knex')

// src/env/index.ts
const import_dotenv = require('dotenv')
const import_zod = require('zod')
if (process.env.NODE_ENV === 'test') {
  ; (0, import_dotenv.config)({
    path: '.env.test',
  })
} else {
  ; (0, import_dotenv.config)()
}
const envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z
    .enum(['development', 'test', 'production'])
    .default('production'),
  DATABASE_URL: import_zod.z.string(),
  PORT: import_zod.z.number().default(3333),
})
const _env = envSchema.safeParse(process.env)
if (_env.success === false) {
  console.error('Invalid environment variables! ', _env.error.format())
  throw new Error('Invalid environment variables!')
}
const env = _env.data

// src/database.ts
var config2 = {
  client: 'sqlite',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}
var knex = (0, import_knex.knex)(config2)
// Annotate the CommonJS export names for ESM import in node:
0 &&
  (module.exports = {
    config,
    knex,
  })
