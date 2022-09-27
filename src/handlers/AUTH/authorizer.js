const jwt = require('jsonwebtoken');
const { setEnvSecrets } = require("../../utils/util")

exports.handler = async (event, context, callback) => {
    try {
        await setEnvSecrets();
        const authHeader = event['headers']['authorization'];
        const token = authHeader.split(" ")[1];

        const isValid = jwt.verify(token, process.env.JWT_SECRET);

        if(isValid) {
            console.log("Allow", event);
            callback(null, generatePolicy('User', 'Allow', event.routeArn));
        } else {
            callback("Unauthorized");
        }
    } catch(err) {
        console.log(err);
        callback("Unauthorized");
    }
};

// Help function to generate an IAM policy
const generatePolicy = (principalId, effect, resource) => {
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument = {};
        policyDocument.Version = '2012-10-17'; 
        policyDocument.Statement = [];
        const statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; 
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement.push(statementOne);
        authResponse.policyDocument = policyDocument;
    }

    return authResponse;
}