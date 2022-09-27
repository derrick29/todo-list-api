const addTodo = require('../src/handlers/TODO/addTodo');
const getTodo = require('../src/handlers/TODO/getTodo');
const getTodos = require('../src/handlers/TODO/getTodos');
const updateTodo = require('../src/handlers/TODO/updateTodo')
const deleteTodo = require('../src/handlers/TODO/deleteTodo')

const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo4LCJ1c2VybmFtZSI6InVuaXQiLCJpYXQiOjE2NjQyNjk4NTJ9.WaOAdy10vVc8sbub345JOY6tBie0SmdBSua0mQbPLI8';

const mockPayloads = [
    {
        payload: {
            "todoTitle": "Todo Unit 1",
            "isTodoItem": false
        },
        expect: "Todo Todo Unit 1 has been created",
        response: data => {
            return data['msg']
        },
        title: 'Add todo'
    },
    {
        payload: {
            "todoTitle": "Todo Unit 1",
            "isTodoItem": false
        },
        expect: "Todo (Todo Unit 1) already exists",
        response: data => {
            return data['msg']
        },
        title: 'Add todo duplicate'
    },
    {
        payload: {
            "todoTitle": "Todo Unit 1"
        },
        expect: "The is todo item field is mandatory.",
        response: data => {
            return data['error']['isTodoItem']['message']
        },
        title: 'Add todo invalid payload'
    },
    {
        payload: {
            "todoId": 1,
            "todoItemTitle": "Todo item 1",
            "isTodoItem": true
        },
        expect: "Todo Todo item 1 has been created",
        response: data => {
            return data['msg']
        },
        title: 'Add todo item'
    },
    {
        payload: {
            "todoId": 1,
            "todoItemTitle": "Todo item 1",
            "isTodoItem": true
        },
        expect: "Todo item (Todo item 1) already exists",
        response: data => {
            return data['msg']
        },
        title: 'Add todo item duplicate'
    },
    {
        payload: {
            "todoId": 1,
            "isTodoItem": true
        },
        expect: "The todo item title field is mandatory.",
        response: data => {
            return data['error']['todoItemTitle']['message']
        },
        title: 'Add todo item invalid payload'
    },
]

const mockPayloads2 = [
    {
        payload: {
            "todoItemId": 1,
            "isTodoItem": true
        },
        expect: 200,
        title: 'Delete todo item'
    },
    {
        payload: {
            "todoId": 1,
            "isTodoItem": false
        },
        expect: 200,
        title: 'Delete todo'
    }
]

const secrets = {
    "S3_BUCKET": 'todolistapp092622',
    "SECRETS_FILE": 'secrets.json'
}

describe('Run all tests', () => {
    describe('Add Todo Tests', () => {
        process.env.S3_BUCKET = secrets['S3_BUCKET'];
        process.env.SECRETS_FILE = secrets['SECRETS_FILE'];
    
        try {
            for(const mockPayload of mockPayloads) {
                const mockEvent = {
                    headers: {
                        'authorization': `Bearer ${mockToken}`
                    },
                    body: JSON.stringify(mockPayload['payload'])
                }
                test(mockPayload['title'], async () => {
                    const data = await addTodo.handler(mockEvent);
                    const msg = mockPayload['response'](JSON.parse(data['body']));
                    expect(msg).toBe(mockPayload['expect'])
                })
            }
        }catch(err) {
            console.log(err)
        }
    })

    describe('Get Todo tests', () => {
        const mockEvent = {
            headers: {
                'authorization': `Bearer ${mockToken}`
            },
            queryStringParameters: {
                todoId: 1
            }
        }
    
        test('Get Todo', async () => {
            const data = await getTodo.handler(mockEvent);
            expect(data.statusCode).toBe(200);
        })

        test('Get Todo Invalid Input', async () => {
            const data = await getTodo.handler({
                headers: {
                    'authorization': `Bearer ${mockToken}`
                }
            });
            expect(data.statusCode).toBe(400);
        })
    
        test('Get All Todos', async () => {
            const data = await getTodos.handler({
                headers: {
                    'authorization': `Bearer ${mockToken}`
                }
            });
            expect(data.statusCode).toBe(200);
        })
    })

    describe('Update and Delete tests', () => {
        const headers = {
            'authorization': `Bearer ${mockToken}`
        }        
        test('Update todo item', async () => {
            const data = await updateTodo.handler({
                headers,
                body: JSON.stringify({
                    "todos": [
                        {
                            "todoItemId": 1,
                            "isDone": true
                        }
                    ]
                })
            });
            expect(data.statusCode).toBe(200);
        })

        test('Update todo item 2', async () => {
            const data = await updateTodo.handler({
                headers,
                body: JSON.stringify({
                    "todos": [
                        {
                            "todoItemId": 1,
                            "isDone": false
                        }
                    ]
                })
            });
            expect(data.statusCode).toBe(200);
        })
    
        for(const payload of mockPayloads2) {
            test(payload['title'], async () => {
                const data = await deleteTodo.handler({
                    headers,
                    body: JSON.stringify(payload['payload'])
                });
                expect(data.statusCode).toBe(200);
            })
        }
    })
})