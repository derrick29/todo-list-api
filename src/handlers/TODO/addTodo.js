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

    const userId = await getUserIdFromToken(event);

    const reqBody = JSON.parse(event['body']);
    const isTodoItem = reqBody['isTodoItem'];

    if(isTodoItem == undefined) {
        return generateResponse(400, {
            error: {
                "isTodoItem": {
                    "message": "The is todo item field is mandatory.",
                    "rule": "required"
                }
            }
        })
    }

    const isPayloadValid = await validate(reqBody, isTodoItem ? 'addTodoItem' : 'addTodo');
    
    if(!isPayloadValid['isValid']) {
        return generateResponse(400, {
            error: isPayloadValid['error']
        })
    }

    try {
        const todoTitle = reqBody['todoTitle'];
        const checkExistsQuery = 'select * from todos where todo_title = $1 and user_id = $2';
        const checkExists = await pool.query(checkExistsQuery, [todoTitle, userId]);

        if(checkExists['rows'].length > 0 && !isTodoItem) {
            return generateResponse(400, {
                msg: `Todo (${todoTitle}) already exists`
            })
        }

        if(!isTodoItem) {
            const query = `insert into todos (todo_title, user_id) values ($1, $2) returning *`;
            await pool.query(query, [todoTitle, userId]);
            return generateResponse(200, {
                msg: `Todo ${todoTitle} has been created`
            })
        }

        const {todoItemTitle, todoId} = reqBody;

        const checkItemExistsQuery = 'select * from todoitems where todo_item_title = $1 and todo_id = $2';
        const checkItemExists = await pool.query(checkItemExistsQuery, [todoItemTitle, todoId]);

        if(checkItemExists['rows'].length > 0) {
            return generateResponse(400, {
                msg: `Todo item (${todoItemTitle}) already exists`
            })
        }
        
        const addItemQuery = 'insert into todoitems (todo_id, todo_item_title, is_done) values ($1, $2, $3) returning *';
        await pool.query(addItemQuery, [todoId, todoItemTitle, false]);
        
        return generateResponse(200, {
            msg: `Todo ${todoItemTitle} has been created`
        })

    } catch (error) {
        console.log(error);
        return generateResponse(500, {
            msg: 'Something went wrong'
        });
    }
}