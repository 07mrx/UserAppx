import { AdapterType } from '../models/adapter-type';

export class AdapterHelper {
    public static getAdapterInfo(adapterKey: string, adapterTypeContent: string | null): AdapterType | null {
        let adapter: AdapterType | null;
        try {
            const adapterData = adapterTypeContent ? JSON.parse(adapterTypeContent) : null;
            if (!adapterData) {
                console.error('Adapter data is empty.');
                return null;
            }

            if (!adapterData.name) {
                console.error('Adapter name is missing.');
                return null;
            }

            if (!adapterData.version) {
                console.error('Adapter version is missing.');
                return null;
            }

            adapter = {
                filePath: adapterKey,
                name: adapterData.name,
                display: adapterData.display,
                version: adapterData.version,
                image: adapterData.image && adapterData.image.data ? adapterData.image.data : null,
            };

        } catch (err) {
            console.error(err);
            return null;
        }
        return adapter;
    }

    public static versionCompare(v1: string, v2: string): number {
        const v1Ary = v1.split('.');
        const v2Ary = v2.split('.');
        const k = Math.min(v1Ary.length, v2Ary.length);
        for (let i = 0; i < k; ++i) {
            const v1Num = parseInt(v1Ary[i], 10);
            const v2Num = parseInt(v2Ary[i], 10);
            if (v1Num > v2Num) { return 1; }
            if (v1Num < v2Num) { return -1; }
        }

        return v1.length === v2.length ? 0 : (v1.length < v2.length ? -1 : 1);
    }
}
