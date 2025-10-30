import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
// Import ZodError to check the error type
import { ZodSchema, ZodError } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      console.log('Validating value:', value);

      if (!this.schema) {
        throw new BadRequestException('No validation schema provided');
      }

      const parsedValue = this.schema.parse(value);
      console.log('Validation successful:', parsedValue);
      return parsedValue;
    } catch (error) {
      // Check if the error is a ZodError
      if (error instanceof ZodError) {
        // Throw a BadRequestException with the formatted Zod errors.
        // This gives the frontend specific details about what went wrong.

        console.log('Zod validation error:', error.flatten().fieldErrors);
        throw new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: error.flatten().fieldErrors,
        });
      }
      console.error('Unexpected error during validation:', error);
      // If it's not a Zod error, re-throw the error to be handled elsewhere
      throw error;
    }
  }
}
