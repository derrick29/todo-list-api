const { Validator } = require('node-input-validator');

const templates = {
    'loginRegister': {
        username: 'required|string',
        password: 'required|string'
    },
    'addTodo': {
        todoTitle: 'required|string',
        isTodoItem: 'required|boolean'
    },
    'addTodoItem': {
        todoId: 'required|integer',
        todoItemTitle: 'required|string',
        isTodoItem: 'required|boolean'
    },
    'updateTodos': {
        todos: 'required|array',
        'todos.*.todoItemId': 'required|integer',
        'todos.*.isDone': 'required|boolean'
    },
    'getTodo': {
        todoId: 'required|integer'
    },
    'deleteTodo': {
        todoId: 'required|integer',
        isTodoItem: 'required|boolean'
    },
    'deleteTodoItem': {
        todoItemId: 'required|integer',
        isTodoItem: 'required|boolean'
    }
}

const validate = async (body, key) => {
    const v = new Validator(body, templates[key]);
    
      const matched = await v.check();
    
      if (!matched) {
        return {
            isValid: false,
            error: v['errors']
        };
      }

      return {
        isValid: true
      };
}

module.exports = {
    validate
}