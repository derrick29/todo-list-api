const { generateResponse, setEnvSecrets, getUserIdFromToken } = require("../../utils/util")

const { Pool } = require('pg');
const { validate } = require("../../utils/validator");

if(!global.pool) {
    global.pool = new Pool({
        max: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 30000,
    });
}

exports.handler = async (event, ctx) => {
    await setEnvSecrets();
    const todoId = event['queryStringParameters'] && event['queryStringParameters']['todoId'] ? event['queryStringParameters']['todoId'] : null;

    const isPayloadValid = await validate({
        todoId
    }, 'getTodo');
    
    if(!isPayloadValid['isValid']) {
        return generateResponse(400, {
            error: isPayloadValid['error']
        })
    }

    try {
        const getQuery = `select * from todoitems where todo_id = $1`;
        const result = await pool.query(getQuery, [todoId]);
        
        return generateResponse(200, {
            result: result['rows']
        })

    } catch (error) {
        console.log(error);
        return generateResponse(500, {
            msg: 'Something went wrong'
        });
    }
}