import { StageVariables } from './stage-variables';

export { ListAdapterTypesRequest, GetAdapterTypeFileRequest, InitDatabaseRequest, UploadAdapterRequest, AdapterType };

interface ListAdapterTypesRequest {
    stagevars: StageVariables;
}

interface GetAdapterTypeFileRequest {
    body: {
        filePath: string;
    };
    stagevars: StageVariables;
}

interface InitDatabaseRequest {
    Records: S3Event[];
}

interface S3Event {
    eventName: string;
    eventSource: string;
    s3: {
        bucket: {
            name: string;
        };
        object: {
            key: string;
            size: number;
        };
    };
}

interface UploadAdapterRequest {
    stagevars: StageVariables;
    body: {
        data: string;
        hash: string;
    };
}

interface AdapterType {
    name: string;
    version: string;
}
