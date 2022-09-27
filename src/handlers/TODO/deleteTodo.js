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

    const isPayloadValid = await validate(reqBody, isTodoItem ? 'deleteTodoItem' : 'deleteTodo');
    
    if(!isPayloadValid['isValid']) {
        return generateResponse(400, {
            error: isPayloadValid['error']
        })
    }

    try {
        const todoId = reqBody['todoId'];
        const checkExistsQuery = 'select * from todos where todo_id = $1 and user_id = $2';
        const checkExists = await pool.query(checkExistsQuery, [todoId, userId]);

        if(checkExists['rows'].length == 0 && !isTodoItem) {
            return generateResponse(400, {
                msg: `Todo with ID (${todoId}) does not exists`
            })
        }

        if(!isTodoItem) {
            const query = `delete from todos where todo_id = $1`;
            await pool.query(query, [todoId]);
            return generateResponse(200, {
                msg: `Todo with ID (${todoId}) has been deleted`
            })
        }

        const todoItemId = reqBody['todoItemId'];

        const checkItemExistsQuery = 'select t.user_id, t.todo_id, ti.todo_item_id from todoitems ti inner join todos t on t.todo_id = ti.todo_id and ti.todo_item_id = $1 and t.user_id = $2';
        const checkItemExists = await pool.query(checkItemExistsQuery, [todoItemId, userId]);

        if(checkItemExists['rows'].length == 0) {
            return generateResponse(400, {
                msg: `Todo item with ID (${todoItemId}) does not exists`
            })
        }
        
        const deleteItemQuery = 'delete from todoitems where todo_item_id = $1';
        await pool.query(deleteItemQuery, [todoItemId]);
        
        return generateResponse(200, {
            msg: `Todo item with ID (${todoItemId}) has been deleted`
        })

    } catch (error) {
        console.log(error);
        return generateResponse(500, {
            msg: 'Something went wrong'
        });
    }
}