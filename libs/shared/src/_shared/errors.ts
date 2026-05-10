export class SchemaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaValidationError';
  }
}

export class InvalidJsonSchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidJsonSchemaError';
  }
}
