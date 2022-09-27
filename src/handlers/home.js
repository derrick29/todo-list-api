const { generateResponse } = require("../utils/util")

const { Pool } = require('pg');

if(!global.pool) {
    global.pool = new Pool({
        max: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
}

exports.handler = async (event, ctx) => {

    console.log("TEST", process.env.STAGE)
    const respBody = {
        msg: 'Hello'
    }

    const query = 'SELECT * from todos';
    const result = await pool.query(query);

    console.log(result['rows']);

    return generateResponse(200, respBody);
}