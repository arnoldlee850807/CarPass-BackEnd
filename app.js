const express = require('express')
const app = express()
const morgan = require('morgan')
const mysql = require('mysql')
const bodyParser = require('body-parser')

// METHOD TO SPERATE CODES INTO OTHER FILE
const router = require('./routes/data.js')
app.use(router)

// SHOW LOG STATUS
// app.use(morgan('combined')) // will get full information
app.use(morgan('short')) 

// LIMIT CONNECTIONS TO AVOID FAILING TO CONNECT WITH MYSQL 
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'handsomearnold',
  database: 'myDataBase'
})

// CONNECT TO MYSQL
function getConnection() {
  return pool
}

// INSERT DATA
app.use(bodyParser.urlencoded({extended: false}))
// Access file in public(http://localhost:3003/form.html)
app.use(express.static('./public'))
// After accessing file in public will automatically call due to the POST action set in form.html
app.post('/user_create', (req, res) => {
  console.log("trying to create a new user...")
  const Type = req.body.create_Type
  const Brand = req.body.create_Brand
  const Model = req.body.create_Model
  const Ejection = req.body.create_Ejection
  const Year = req.body.create_Year
  const Location = req.body.create_Location
  const Price = req.body.create_Price

  const queryString = "INSERT INTO hundredthousand (Type, Brand, Model, Ejection, Year, Location, Price) Values (?, ?, ?, ?, ?, ?, ?)"
  getConnection.query(queryString, [Type, Brand, Model, Ejection, Year, Location, Price], (err, results, field) => {
    if (err) {
      console.log("Failed to insert: " + err)
      res.sendStatus(500)
      return
    }
    //console.log("Insert a new user with id: ", results.insertID)
    res.end()
  })
})

// SHOW DATA WITH SPECIFIC Type EX:(http://localhost:3003/data/American)
app.get('/data/:Type', (req, res) => {
  console.log("Fetching data with id: " + req.params.Type)

  // Setting connection to mysql
  const connection = getConnection()

  // Query Setting
  const selectType = req.params.Type
  const queryString = "SELECT * FROM hundredthousand WHERE Type = ?"
  connection.query(queryString, [selectType], (err, rows, fields) => {

    if (err) {
      console.log("Failed to query for select type: "+ err)
      res.sendStatus(500)
      return
    }

    console.log("Fetch data successful")
    res.json(rows)
  })
})

// SHOW ALL DATA(http://localhost:3003/data)
app.get('/data', (req, res) => {
  console.log("Fetching data")

  // Setting connection to mysql
  const connection = getConnection()

  // Query Setting
  const queryString = "SELECT * FROM hundredthousand"
  connection.query(queryString, (err, rows, fields) => {

    if (err) {
      console.log("Failed to fetch data: "+ err)
      res.sendStatus(500)
      return
    }

    console.log("Fetch data successful")
    res.json(rows)
  })
})

// SHOW ROOT(http://localhost:3003/)
app.get("/", (req, res) => {
  console.log("Responding to root route")
  res.send("Hello from Root")
})

// SHOW TESTING(http://localhost:3003/testing)
app.get("/testing", (req, res) => {
  res.send("Testing")
})

const PORT = process.env.PORT || 3003
// SET PORT TO 3003
app.listen(PORT, () => {
  console.log("Server is up and listening on: " + PORT)
})
