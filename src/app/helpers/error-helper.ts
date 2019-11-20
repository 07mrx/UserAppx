
import { ErrorResponse, ErrorType } from '../models/error-type';

export class ErrorHelper {

    public static makeError(type: ErrorType, message: string): string {
        let code: string;

        switch (type) {
            case ErrorType.BadRequest:
                code = 'BadRequest';
                break;
            case ErrorType.NotFound:
                code = 'NotFound';
                break;
            case ErrorType.InternalServerError:
                code = 'InternalServerError';
                break;
            case ErrorType.Unauthorized:
                code = 'Unauthorized';
                break;
            default:
                code = 'BadRequest';
                break;
        }

        const error: ErrorResponse = {
            code: code,
            publicMessage: message,
        };

        return JSON.stringify(error);
    }
}
