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

    const reqBody = JSON.parse(event['body']);

    const isPayloadValid = await validate(reqBody, 'updateTodos');
    
    if(!isPayloadValid['isValid']) {
        return generateResponse(400, {
            error: isPayloadValid['error']
        })
    }

    try {
        const todos = reqBody['todos']
        const setDone = [];
        const setNotDone = [];
        let cursor = 0;

        for(const item of todos) {
            if(item['isDone']) {
                setDone.push(item['todoItemId']);
            }else{
                setNotDone.push(item['todoItemId'])
            }
        }

        let getQuery = `update todoitems set is_done = case when todo_item_id in (<CURSOR_1>) then <BOOL_1> else <BOOL_2> end where todo_item_id in (<CURSOR_2>)`;
        const values = [];
        if(setDone.length > 0) {
            getQuery = getQuery.replace("<CURSOR_1>", setDone.map(m => `$${++cursor}`));
            getQuery = getQuery.replace("<BOOL_1>", "true");
            getQuery = getQuery.replace("<BOOL_2>", "false");
            values.push(...setDone);
        } else if(setNotDone.length > 0) {
            getQuery = getQuery.replace("<CURSOR_1>", setNotDone.map(m => `$${++cursor}`));
            getQuery = getQuery.replace("<BOOL_1>", "false");
            getQuery = getQuery.replace("<BOOL_2>", "true");
            values.push(...setNotDone);
        }
        
        getQuery = getQuery.replace("<CURSOR_2>", todos.map(m => `$${++cursor}`));
        values.push(...todos.map(m => m['todoItemId']));
        await pool.query(getQuery, values);
        
        return generateResponse(200, {
            msg: 'Todo items status updated'
        })

    } catch (error) {
        console.log(error);
        return generateResponse(500, {
            msg: 'Something went wrong'
        });
    }
}