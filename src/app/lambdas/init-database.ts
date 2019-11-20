import { Handler } from 'aws-lambda';
import { AdapterHelper } from '../helpers/adapter-helper';
import { S3Helper } from '../helpers/storage-helper';
import { DatabaseHelper } from '../helpers/database-helper';
import { ErrorHelper } from '../helpers/error-helper';
import { ErrorType } from '../models/error-type';
import { InitDatabaseRequest } from '../models/request-type';
import { InitDatabaseResponse } from '../models/response-type';

export const handler: Handler<InitDatabaseRequest, InitDatabaseResponse> = async (_event, _context, _callback) => {
    validateBody(_event);
    const adapterTypesBucket = _event.Records[0].s3.bucket.name;
    const adapterTypeFilePath = decodeURIComponent(_event.Records[0].s3.object.key.replace(/\+/g, ' '));

    const adapterTypesTable = process.env.ADAPTERS_TABLE || '';
    if (!adapterTypesTable) {
        throw ErrorHelper.makeError(ErrorType.InternalServerError, 'ADAPTERS_TABLE environment variable is missing.');
    }

    const getObjectResult = await S3Helper.getObject(adapterTypesBucket, adapterTypeFilePath);
    if (getObjectResult.error) {
        throw ErrorHelper.makeError(
            ErrorType.InternalServerError,
            `Error reading '${adapterTypeFilePath}' adapter type file from S3 bucket: ${getObjectResult.error}.`);
    }

    const adapterInfo = AdapterHelper.getAdapterInfo(adapterTypeFilePath, getObjectResult.data);
    if (!adapterInfo) {
        console.error(`Error parsing data for '${adapterTypeFilePath}' adapter type file.`);
        throw ErrorHelper.makeError(ErrorType.InternalServerError, 'Adapter Type file is invalid.');
    }

    const dynamoAdapter = await DatabaseHelper.getAdapterTypeByName(adapterTypesTable, adapterInfo.name);
    if (!dynamoAdapter.data ||
        (dynamoAdapter.data && AdapterHelper.versionCompare(dynamoAdapter.data.version, adapterInfo.version) < 0)) {
        const dbSaveResult = await DatabaseHelper.insertOrUpdateAdapterType(adapterTypesTable, adapterInfo);
        if (!dbSaveResult.data) {
            throw ErrorHelper.makeError(ErrorType.InternalServerError, 'Adapter Type could not be saved.');
        }
    }

    return {
        adapter: adapterTypeFilePath,
    };
};

const validateBody = (event: InitDatabaseRequest) => {
    if (!event.Records) {
        throw ErrorHelper.makeError(ErrorType.BadRequest, 'Bad Request. No event Records.');
    }
    if (event.Records.length !== 1) {
        throw ErrorHelper.makeError(ErrorType.BadRequest, 'Bad Request. Expected one record.');
    }
    if (!event.Records[0].s3 || !event.Records[0].s3.object || !event.Records[0].s3.bucket) {
        throw ErrorHelper.makeError(ErrorType.BadRequest, 'Bad Request. Invalid s3 event.');
    }
    if (!event.Records[0].s3.bucket.name) {
        throw ErrorHelper.makeError(ErrorType.BadRequest, 'Bad Request. No bucket name found for event.');
    }
    if (!event.Records[0].s3.object.key) {
        throw ErrorHelper.makeError(ErrorType.BadRequest, 'Bad Request. No key found for event file.');
    }
};
