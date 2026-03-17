import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

export class AppBadRequestException extends BadRequestException {
  private constructor(response: { message: string; field?: string }) {
    super(response);
  }

  static formError(message: string): AppBadRequestException {
    return new AppBadRequestException({ message });
  }

  static fieldError(field: string, message: string): AppBadRequestException {
    return new AppBadRequestException({ message, field });
  }

  static unknown(): AppBadRequestException {
    return new AppBadRequestException({ message: 'Something went wrong. Please try again.' });
  }
}

export class AppForbiddenException extends ForbiddenException {
  constructor() {
    super({ code: 'NOT_FOUND_OR_ACCESS_DENIED', message: 'Not found or no access' });
  }
}

export class AppNotFoundException extends NotFoundException {
  constructor() {
    super({ code: 'NOT_FOUND_OR_ACCESS_DENIED', message: 'Not found or no access' });
  }
}
