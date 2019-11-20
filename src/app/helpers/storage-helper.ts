import { S3 } from 'aws-sdk';
import { OperationResult } from '../models/response-type';

export abstract class S3Helper {
    public static async listKeys(bucketName: string, keyPrefix: string = ''): Promise<OperationResult<string[]>> {
        const data: string[] = [];
        let error: void | Error;

        try {
            const s3 = S3Helper.initS3(bucketName);

            await this.getKeys(s3, { Bucket: bucketName, Prefix: keyPrefix }, data);
        } catch (err) {
            console.log(`Error listing objects from S3 bucket: ${err}.`);
            error = err;
        }

        return {
            data: data,
            error: error,
        };
    }

    public static async getObject(bucketName: string, objectKey: string): Promise<OperationResult<string>> {
        let data: null | string = null;
        let error: void | Error;

        try {
            const s3 = S3Helper.initS3(bucketName);

            const objectParams = {
                Bucket: bucketName,
                Key: objectKey,
            };

            const response = await s3.getObject(objectParams).promise();
            error = response.$response.error;

            if (!error) {
                data = response.Body ? response.Body.toString() : null;
            }
        } catch (err) {
            error = err;
        }

        if (error) {
            console.log(`Error getting object data from S3 bucket: ${error}.`);
        }

        return {
            data: data,
            error: error,
        };
    }

    public static async putObject(bucketName: string, objectKey: string = '', object: S3.Body): Promise<OperationResult<boolean>> {
        let error: void | Error;

        try {
            const s3 = S3Helper.initS3(bucketName);

            const putParams = {
                Bucket: bucketName,
                Key: objectKey,
                Body: object,
            };
            const response = await s3.putObject(putParams).promise();
            error = response.$response.error;
            if (error) {
                console.log(`error saving in ${bucketName}, obj key ${objectKey}, obj ${object}`);
            }
        } catch (err) {
            console.log(`Error saving object to S3 bucket: ${err}.`);
            error = err;
        }

        return {
            data: !error,
            error: error,
        };
    }

    private static initS3(bucketName: string): S3 {
        return new S3({
            apiVersion: '2006-03-01',
            params: { Bucket: bucketName },
        });
    }

    private static async getKeys(s3: S3, params: S3.ListObjectsV2Request, keys: string[]) {
        const response = await s3.listObjectsV2(params).promise();

        if (response && response.Contents && response.Contents.length > 0) {
            response.Contents.forEach(obj => {
                if (obj && obj.Key) {
                    keys.push(obj.Key);
                }
            });
        }

        if (response.IsTruncated) {
            const newParams = { ...params };
            newParams.ContinuationToken = response.NextContinuationToken;
            await S3Helper.getKeys(s3, newParams, keys);
        }
    }
}
