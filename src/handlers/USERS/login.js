const { generateResponse, setEnvSecrets } = require("../../utils/util")

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validate } = require("../../utils/validator");

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

        if(checkExists['rows'].length == 0) {
            return generateResponse(400, {
                msg: 'No user found'
            })
        }

        const user = checkExists['rows'][0];
        const auth = await bcrypt.compare(password, user['password']);

        if(auth) {
            const token = jwt.sign({
                user_id: user['user_id'],
                username: user['username']
            }, process.env.JWT_SECRET);

            return generateResponse(200, {
                token
            });
        }

        return generateResponse(400, {
            msg: 'Incorrect password'
        })

    } catch (error) {
        console.log(error);
        return generateResponse(500, {
            msg: 'Something went wrong'
        });
    }
}