import { ArgumentMetadata, BadRequestException, Logger, PipeTransform } from '@nestjs/common';
// Import ZodError to check the error type
import { ZodError, ZodType } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      if (!this.schema) {
        throw new BadRequestException('No validation schema provided');
      }

      return this.schema.parse(value);
    } catch (error) {
      // Check if the error is a ZodError
      if (error instanceof ZodError) {
        // Throw a BadRequestException with the formatted Zod errors.
        // This gives the frontend specific details about what went wrong.

        Logger.error('Zod validation error:', error.flatten().fieldErrors);
        throw new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: error.flatten().fieldErrors,
        });
      }
      Logger.error('Unexpected error during validation:', error);
      // If it's not a Zod error, re-throw the error to be handled elsewhere
      throw error;
    }
  }
}
