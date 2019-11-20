import { Handler, CustomAuthorizerResult, CustomAuthorizerEvent, PolicyDocument, AuthResponseContext } from 'aws-lambda';

export const handler: Handler<CustomAuthorizerEvent, CustomAuthorizerResult> = async (event, _) => {

    // console.log(`AuthHandler: entered: ${JSON.stringify(event)}`);

    // Three cases:
    // 1. The token is valid and the user has access
    // 2. The token is valid and the user does not have access (response: 403 forbidden)
    // 3. The token is missing or is not valid (response: 401 unauthorized)

    const token = event.authorizationToken;
    if (token) {
        let userId: string | undefined;

        const match = token.match(/^UIP ([a-zA-Z0-9-_]+)$/);
        if (match) {
            userId = match[1];
        }

        if (userId) {
            // Case 1
            const principalId = userId;
            return AuthHelper.generatePolicy(true, principalId, event.methodArn);
        } else {
            // Case 2
            return AuthHelper.generatePolicy(false, '', event.methodArn);
        }
    } else {
        // Case 3
        throw new Error('Unauthorized');  // Return a 401 Unauthorized response
    }
};

class AuthHelper {

    public static generatePolicy(allowed: boolean, principalId: string, resource: string): CustomAuthorizerResult {

        const policyDocument: PolicyDocument = {
            Version: '2012-10-17',  // default version
            Statement: [
                {
                    Action: 'execute-api:Invoke',   // default action
                    Effect: allowed ? 'Allow' : 'Deny',
                    Resource: resource,
                },
            ],
        };

        const context: AuthResponseContext = {
            // custom fields we can set in the response
        };

        return {
            principalId: principalId,
            policyDocument: policyDocument,
            context: context,
        };
    }
}
