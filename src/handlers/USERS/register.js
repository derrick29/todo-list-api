const { generateResponse, setEnvSecrets } = require("../../utils/util");
const { validate } = require("../../utils/validator");

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

if(!global.pool) {
    global.pool = new Pool({
        max: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 30000,
    });
}

const STAGE = process.env.STAGE;

exports.handler = async (event, ctx) => {

    await setEnvSecrets();

    const reqBody = JSON.parse(event['body']);
    const {username, password} = reqBody;

    const isPayloadValid = await validate(reqBody, 'loginRegister');
    
    if(!isPayloadValid['isValid']) {
        return generateResponse(400, {
            error: isPayloadValid['error']
        })
    }

    try {
        const checkExistsQuery = 'select * from todosusers where username = $1';
        const checkExists = await pool.query(checkExistsQuery, [username]);

        if(checkExists['rows'].length > 0) {
            return generateResponse(400, {
                msg: 'Username already taken'
            })
        }

        const salt = await bcrypt.genSalt();
        const encryptedPass = await bcrypt.hash(password, salt);

        const query = `insert into todosusers (username, password) values ($1, $2) returning *`;
        const result = await pool.query(query, [username, encryptedPass]);

        return generateResponse(200, result['rows']);
    } catch (error) {
        console.log(error);
        return generateResponse(500, {
            msg: 'Something went wrong'
        });
    }
}