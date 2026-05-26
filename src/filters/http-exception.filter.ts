import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private logger = new Logger('GlobalExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    // ── Handle HttpException ──────────────────
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as any;
        message = res.message || message;
        errors = Array.isArray(res.message) ? res.message : null;
        if (errors) message = 'Validation failed';
      }
    }

    // ── Handle Prisma Errors ──────────────────
    else if (exception instanceof Error) {
      const prismaError = exception as any;

      if (prismaError.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = `${prismaError.meta?.target?.[0] ?? 'Field'} already exists`;
      } else if (prismaError.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
      } else if (prismaError.code === 'P2003') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Related record not found';
      } else {
        message = exception.message || message;
      }
    }

    // ── Log Error ─────────────────────────────
    this.logger.error(
      `${request.method} ${request.url} — ${status} — ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    // ── Send Response ─────────────────────────
    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });
  }
}
