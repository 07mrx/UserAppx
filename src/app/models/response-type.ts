import { AdapterType } from './adapter-type';

export {
    GetAdapterTypeFileContentResult, ResponseResult, OperationResult,
    ListAdapterTypesResponse, GetAdapterTypeFileResponse,
    InitDatabaseResponse, UploadAdapterFileResponse,
};

interface GetAdapterTypeFileContentResult {
    data: null | string;
    error: null | string;
}

interface ResponseResult {
    statusCode: string;
    body: string;
    headers: {
        'Access-Control-Allow-Origin': string;
        'Access-Control-Allow-Headers': string;
        'Content-Type': string;
    };
    isBase64Encoded: boolean;
}

interface ListAdapterTypesResponse {
    adapterTypes: AdapterType[];
}

interface GetAdapterTypeFileResponse {
    adapterFileData: null | string;
}

interface OperationResult<T> {
    data: null | T;
    error: void | Error;
}

interface InitDatabaseResponse {
    adapter: string;
}

interface UploadAdapterFileResponse {
    isUploaded: boolean;
}
