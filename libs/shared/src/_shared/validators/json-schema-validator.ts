import Ajv, { Schema } from 'ajv';
import addFormats from 'ajv-formats';
import { SchemaValidationError, InvalidJsonSchemaError } from '../errors';

class SchemaValidator {
  private readonly ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
  }

  validateOrReject(schema: Schema, data: unknown): void {
    let validate;
    try {
      validate = this.ajv.compile(schema);
    } catch (err) {
      throw new InvalidJsonSchemaError(
        `Invalid JSON schema: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    const valid = validate(data);
    if (!valid) {
      const messages = this.ajv.errorsText(validate.errors, { separator: '; ' });
      throw new SchemaValidationError(`Validation failed: ${messages}`);
    }
  }
}

export const schemaValidator = new SchemaValidator();
