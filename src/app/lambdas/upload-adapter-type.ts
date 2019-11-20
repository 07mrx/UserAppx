import { Handler } from 'aws-lambda';
import { S3Helper } from '../helpers/storage-helper';
import { ErrorHelper } from '../helpers/error-helper';
import { ErrorType } from '../models/error-type';
import { UploadAdapterRequest } from '../models/request-type';
import { UploadAdapterFileResponse } from '../models/response-type';
import { AdapterType } from '../models/adapter-type';
import * as crypto from 'crypto';

export const handler: Handler<UploadAdapterRequest, UploadAdapterFileResponse> = async (_event, _) => {
    validateBody(_event);
    const adapterTypesBucketName = _event.stagevars.uipAdapterTypesBucket;

    const base64String = _event.body.data;
    const buffer = Buffer.from(base64String, 'base64');
    const adapterFileContent = buffer.toString();
    validateContent(buffer, _event.body.hash);

    const adapterFile: AdapterType = JSON.parse(adapterFileContent);
    validateAdapterType(adapterFile);

    const objectKey = `adapterTypes/${adapterFile.name}/${adapterFile.version}/adapterType-${adapterFile.name}.json`;
    const result = await S3Helper.putObject(adapterTypesBucketName, objectKey, buffer);

    if (!result.error) {
        const response: UploadAdapterFileResponse = {
            isUploaded: true,
        };
        return response;
    }

    throw ErrorHelper.makeError(ErrorType.InternalServerError, result.error.message);
};

const validateBody = (event: UploadAdapterRequest) => {
    if (!event.body) {
        throw ErrorHelper.makeError(ErrorType.BadRequest, 'Bad Request. Request body is empty.');
    }

    if (!event.body.data || !event.body.hash) {
        throw ErrorHelper.makeError(ErrorType.BadRequest, 'Bad Request. Request body is invalid.');
    }
};

const validateContent = (buffer: Buffer, hash: string) => {
    const hashAlgorithm = crypto.createHash('sha512');
    hashAlgorithm.update(buffer);
    const computedHash = hashAlgorithm.digest().toString('hex');

    if (computedHash !== hash) {
        throw ErrorHelper.makeError(ErrorType.BadRequest, 'Bad Request. Invalid Adapter Type data.');
    }
};

const validateAdapterType = (adapterType: AdapterType) => {
    if (!adapterType) {
        throw ErrorHelper.makeError(ErrorType.BadRequest, 'Bad Request. Adapter Type is empty.');
    }

    if (!adapterType.name || !adapterType.version) {
        throw ErrorHelper.makeError(ErrorType.BadRequest, 'Bad Request. Adapter Type is invalid.');
    }
};
