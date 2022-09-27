const { generateResponse, setEnvSecrets, getUserIdFromToken } = require("../../utils/util")

const { Pool } = require('pg');

if(!global.pool) {
    global.pool = new Pool({
        max: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 30000,
    });
}

const ITEMS_PER_PAGE = 10;

exports.handler = async (event, ctx) => {
    await setEnvSecrets();
    const userId = await getUserIdFromToken(event);
    const page = event['queryStringParameters'] && event['queryStringParameters']['page'] ? event['queryStringParameters']['page'] : 1;
    const offset = (+page - 1) * ITEMS_PER_PAGE;

    try {
        const getItemsCountQuery = `select count(1) from todos where user_id = $1`;
        const getItemsCount = await pool.query(getItemsCountQuery, [userId]);
        const itemsCount = +getItemsCount['rows'][0]['count'];

        if(itemsCount == 0) {
            return generateResponse(200, {
                totalItems: 0,
                totalPages: 0,
                result: []
            })
        }

        const getQuery = `select todo_id, todo_title from todos where user_id = $1 offset ${offset} limit ${ITEMS_PER_PAGE}`;
        const result = await pool.query(getQuery, [userId]);
        
        return generateResponse(200, {
            currentPage: page,
            totalPages: Math.ceil(itemsCount / ITEMS_PER_PAGE), 
            totalItems: itemsCount,
            result: result['rows']
        })

    } catch (error) {
        console.log(error);
        return generateResponse(500, {
            msg: 'Something went wrong'
        });
    }
}