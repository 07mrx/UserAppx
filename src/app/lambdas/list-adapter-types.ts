import { Handler } from 'aws-lambda';
import { DatabaseHelper } from '../helpers/database-helper';
import { ErrorHelper } from '../helpers/error-helper';
import { ListAdapterTypesRequest } from '../models/request-type';
import { ListAdapterTypesResponse } from '../models/response-type';
import { ErrorType } from '../models/error-type';
import { AdapterType } from '../models/adapter-type';

export const handler: Handler<ListAdapterTypesRequest, ListAdapterTypesResponse> = async (_event, _) => {
    const adapterTypesTable = _event.stagevars.uipAdapterTypesTable;

    const result = await DatabaseHelper.getAdapterTypes(adapterTypesTable);

    if (result.error) {
        throw ErrorHelper.makeError(ErrorType.InternalServerError, result.error.message);
    }
    if (!result.data) {
        throw ErrorHelper.makeError(ErrorType.InternalServerError, 'Adapter list could not be retrieved');
    }

    const adapterTypes = result.data;
    adapterTypes.sort((a: AdapterType, b: AdapterType) => {
        return (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0);
    });

    const response: ListAdapterTypesResponse = {
        adapterTypes: adapterTypes,
    };

    return response;
};
