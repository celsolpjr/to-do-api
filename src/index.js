const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  
  const { username } = request.headers;

  const user = users.find((user) => {
    return user.username === username;
  })

  if (!user) {
    return response.status(404).json({ error: "user not found!" });
  }

  request.user = user;

  next();

}

app.post('/users', (request, response) => {
  
  const { name, username } = request.body;

  const usernameExists = users.find((user) => {
    return user.username === username
  })

  if (usernameExists) {
    return response.status(400).json({ error: "username exists!" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser);

  return response.status(201).json(newUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  
  const { user } = request;

  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const updateTodo = user.todos.find((todo) => {
    if (todo.id === id) {
      return todo;
    }
  })

  if (!updateTodo) {
    return response.status(404).json({error: "todo not exists!"});
  } 
  else {
    updateTodo.title = title;
    updateTodo.deadline = deadline;
  }
  
  response.status(200).json(updateTodo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  
  const { user } = request;
  const { id } = request.params;

  const selectTodo = user.todos.find( (todo) => {
    if (todo.id === id) {
      return todo;
    }
  } )

  if (!selectTodo) {
    return response.status(404).json({error: "todo not exists!"})
  }
  else {
    selectTodo.done = true;
  }

  return response.status(200).json(selectTodo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const { user } = request;
  const { id } = request.params;

  const existTodo = user.todos.find( (todo) => {
    return todo.id === id;
  } )

  const newTodos = user.todos.filter( (todo) => {
    if (todo.id != id) {
      return todo;
    }
  } )

  if (!existTodo) {
    return response.status(404).json({error: "todo not exists!"})
  }
  else {
    user.todos = newTodos;
  }

  return response.status(204).json(newTodos);

});

module.exports = app;