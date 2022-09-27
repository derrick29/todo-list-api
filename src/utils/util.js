const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const jwt = require('jsonwebtoken');

const util = {
    "generateResponse": (statusCode, body) => {
        return {
            statusCode,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        }
    },
    "getSecrets": (params) => {
        return new Promise((resolve, reject) => {
            s3.getObject(params, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    console.log("Successfully retrieved secrets");
                    resolve(data);
                }
            });
        });
    },
    "setEnvSecrets": async () => {
        try {
            const rawSecrets = await util.getSecrets(
                {
                    "Bucket": process.env.S3_BUCKET,
                    "Key": process.env.SECRETS_FILE
                }
            );

            const secrets = JSON.parse(Buffer.from(rawSecrets['Body']).toString('utf8'));

            process.env.PGHOST = secrets['PGHOST'];
            process.env.PGUSER = secrets['PGUSER'];
            process.env.PGDATABASE = secrets['PGDATABASE'];
            process.env.PGPASSWORD = secrets['PGPASSWORD'];
            process.env.PGPORT = secrets['PGPORT'];
            process.env.JWT_SECRET = secrets['JWT_SECRET'];

        } catch(err) {
            console.log("Error setting secrets. Using defaults/")
            console.log(err);
        }
    },
    "getUserIdFromToken": async (event) => {
        const authHeader = event['headers']['authorization'];
        const token = authHeader.split(" ")[1];

        const decodedToken = jwt.decode(token);
        const {user_id} = decodedToken;

        return user_id;
    }
}

module.exports = util;