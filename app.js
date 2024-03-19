const express = require('express')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')

const app = express()
app.use(express.json())

let db = null
const dbPath = path.join(__dirname, 'todoApplication.db')

//Initalising the DB and Server

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error:${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

module.exports = app

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}
const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

app.get('/todos/', async (request, response) => {
  let data = null
  const {search_q = '', priority, status} = request.query
  let getTodoQuery = ''
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodoQuery = `
        SELECT *
        FROM 
          todo
        WHERE
          todo LIKE "%${search_q}%"
          AND priority = "${priority}"
          AND status = "${status}";`
      break
    case hasPriorityProperty(request.query):
      getTodoQuery = `
        SELECT *
        FROM 
          todo
        WHERE
          todo LIKE "%${search_q}%"
          AND priority = "${priority}";`
      break
    case hasStatusProperty(request.query):
      getTodoQuery = `
        SELECT *
        FROM 
          todo
        WHERE
          todo LIKE "%${search_q}%"
          AND status = "${status}";`
      break
    default:
      getTodoQuery = `
        SELECT *
        FROM 
          todo
        WHERE
          todo LIKE "%${search_q}%";`
  }
  data = await db.all(getTodoQuery)
  response.send(data)
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodoQuery = `
    SELECT *
    FROM todo
    WHERE
      id =${todoId};`
  const dbResponse = await db.get(getTodoQuery)
  response.send(dbResponse)
})

//create todo Table

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const createTodoTable = `
      INSERT INTO 
        todo(id,todo,priority,status)
      VALUES(
        ${id},
        "${todo}",
        "${priority}",
        "${status}"
      );
      `
  await db.run(createTodoTable)

  response.send('Todo Successfully Added')
})
