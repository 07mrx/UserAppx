export { ErrorResponse, ErrorType };

interface ErrorResponse {
    code: string;
    publicMessage: string;
}

enum ErrorType {
    BadRequest,
    NotFound,
    InternalServerError,
    Unauthorized,
}
