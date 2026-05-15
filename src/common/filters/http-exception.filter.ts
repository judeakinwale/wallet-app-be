import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

// type ExceptionObject = string | { message: string; [key: string]: any };
const parseErrorMessage = (exceptionResponse: string | object) => {
  if (typeof exceptionResponse === 'string') {
    return exceptionResponse;
  }
  if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
    return exceptionResponse.message;
  }
  if (typeof exceptionResponse === 'object') {
    return Object.values(exceptionResponse).flat().join(', ');
  }
  return 'An error occurred';
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      success: false,
      statusCode: status,
      message: parseErrorMessage(exceptionResponse),
      timestamp: new Date().toISOString(),
    });
  }
}
