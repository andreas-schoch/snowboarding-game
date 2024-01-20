export interface ObjectSchema {
  type: 'object';
  properties: {[key: string]: Schema};
}

export interface ArraySchema {
  type: 'array';
  items: Schema;
}

export interface ArrayMixedSchema {
  type: 'arrayMixedObject';
  items: {[discriminator: string]: ObjectSchema};
}

export interface PrimitiveIntegerSchema {
  type: 'int';
  size: 'uint8' | 'uint16' | 'uint32'
}

export interface PrimitiveStringSchema {
  type: 'string';
}

export type Schema = PrimitiveIntegerSchema | PrimitiveStringSchema | ObjectSchema | ArraySchema | ArrayMixedSchema;

export const isArrayMixed = (data: unknown): data is {type: string, [key: string]: unknown}[] => {
  return Boolean(data && typeof data === 'object' && data.hasOwnProperty('type'));
};
