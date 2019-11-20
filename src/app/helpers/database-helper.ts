import { DynamoDB } from 'aws-sdk';
import { AdapterTypeKey, AdapterType } from '../models/adapter-type';
import { OperationResult } from '../models/response-type';

export abstract class DatabaseHelper {
    public static async getAdapterTypes(tableName: string): Promise<OperationResult<AdapterType[]>> {
        return DatabaseHelper.loadAdapterTypes<AdapterType>(tableName);
    }

    public static async getAdapterTypeKeys(tableName: string): Promise<OperationResult<AdapterTypeKey[]>> {
        return DatabaseHelper.loadAdapterTypes<AdapterTypeKey>(tableName);
    }

    public static async getAdapterTypeByName(tableName: string, adapterName: string): Promise<OperationResult<AdapterType>> {
        let data = null;
        let error: void | Error;

        try {
            const docClient = new DynamoDB.DocumentClient();

            const params: DynamoDB.DocumentClient.QueryInput = {
                TableName: tableName,
                KeyConditionExpression: '#name = :adapterName',
                ExpressionAttributeNames: {
                    '#name': 'name',
                },
                ExpressionAttributeValues: {
                    ':adapterName': adapterName,
                },
            };

            const response = await docClient.query(params).promise();

            if (response.Items && response.Items.length > 0) {
                data = response.Items[0] as AdapterType;
            }
        } catch (err) {
            error = err;
            console.log(`Error loading the adapter type from the database: ${err}.`);
        }

        return {
            data: data,
            error: error,
        };
    }

    public static async insertOrUpdateAdapterType(adapterTypesTable: string, adapterType: AdapterType): Promise<OperationResult<boolean>> {
        let error: void | Error;

        try {
            const docClient = new DynamoDB.DocumentClient();
            const adapterTypeItem: DynamoDB.DocumentClient.PutItemInput = {
                Item: adapterType,
                TableName: adapterTypesTable,
            };

            await docClient.put(adapterTypeItem).promise();
        } catch (err) {
            error = err;
            console.log(`Error inserting or updating adapter type with name: ${adapterType.name} in the database: ${err}.`);
        }

        return {
            data: !error,
            error: error,
        };
    }

    public static async deleteAdapterType(adapterTypesTable: string, adapterType: AdapterType) {
        let error: void | Error;

        try {
            const docClient = new DynamoDB.DocumentClient();
            const adapterTypeItem: DynamoDB.DocumentClient.DeleteItemInput = {
                TableName: adapterTypesTable,
                Key: {
                    filePath: adapterType.name,
                },
            };

            await docClient.delete(adapterTypeItem).promise();
        } catch (err) {
            error = err;
            console.log(`Error deleting adapter type with name: ${adapterType.name} from the database: ${err}.`);
        }

        return {
            data: !error,
            error: error,
        };
    }

    public static async deleteAdapterTypes(tableName: string): Promise<OperationResult<AdapterTypeKey[]>> {
        let data: AdapterTypeKey[] = [];
        let error: void | Error;

        try {
            const adapterTypesKeys = await DatabaseHelper.getAdapterTypeKeys(tableName);

            if (adapterTypesKeys.error) {
                return adapterTypesKeys;
            }

            if (adapterTypesKeys.data === null || adapterTypesKeys.data.length === 0) {
                return {
                    data: data,
                    error: undefined,
                };
            }

            const docClient = new DynamoDB.DocumentClient();
            // Do not modify this value. This is the maximum value acccepted by batchWrite function.
            const batchSize = 25;
            const deleteBatches = Math.ceil(adapterTypesKeys.data.length / batchSize);

            for (let idx = 0; idx < deleteBatches; idx++) {
                const items = adapterTypesKeys.data.slice(idx * batchSize,
                    // tslint:disable-next-line: align
                    idx !== deleteBatches - 1 ? idx * batchSize + batchSize : adapterTypesKeys.data.length);

                const deleteItems = items.map(atk => {
                    return {
                        DeleteRequest: {
                            Key: {
                                filePath: atk.name,
                            },
                        },
                    };
                });

                const params: DynamoDB.DocumentClient.BatchWriteItemInput = {
                    RequestItems: {
                    },
                };
                params.RequestItems[tableName] = deleteItems;

                await docClient.batchWrite(params).promise();
            }

            data = adapterTypesKeys.data;
        } catch (err) {
            error = err;
            console.log(`Error deleting the adapter types from the database: ${err}.`);
        }

        return {
            data: data,
            error: error,
        };
    }

    private static async loadAdapterTypes<T extends AdapterTypeKey>(tableName: string): Promise<OperationResult<T[]>> {
        let data: T[] = [];
        let error: void | Error;

        try {
            const docClient = new DynamoDB.DocumentClient();
            const params: DynamoDB.DocumentClient.ScanInput = {
                TableName: tableName,
            };

            const response = await docClient.scan(params).promise();

            if (response.Items && response.Items.length > 0) {
                data = response.Items as T[];
            }
        } catch (err) {
            error = err;
            console.log(`Error loading the adapter types from the database: ${err}.`);
        }

        return {
            data: data,
            error: error,
        };
    }
}
