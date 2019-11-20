import { Handler } from 'aws-lambda';
import { S3Helper } from '../helpers/storage-helper';
import { ErrorHelper } from '../helpers/error-helper';
import { ErrorType } from '../models/error-type';
import { GetAdapterTypeFileRequest } from '../models/request-type';
import { GetAdapterTypeFileResponse } from '../models/response-type';

export const handler: Handler<GetAdapterTypeFileRequest, GetAdapterTypeFileResponse> = async (_event, _) => {
    const adapterTypesBucketName = _event.stagevars.uipAdapterTypesBucket;

    if (!_event.body) {
        throw ErrorHelper.makeError(ErrorType.BadRequest, 'Request body is missing.');
    }

    const adapterKey = _event.body.filePath;

    if (!adapterKey) {
        throw ErrorHelper.makeError(ErrorType.BadRequest, 'Missing filePath field in request body.');
    }

    const result = await S3Helper.getObject(adapterTypesBucketName, adapterKey);

    if (!result.error) {
        const response: GetAdapterTypeFileResponse = {
            adapterFileData: result.data,
        };

        return response;
    }

    throw ErrorHelper.makeError(ErrorType.InternalServerError, result.error.message);
};
