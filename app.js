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
  host: '127.0.0.1',
  user: 'root',
  password: 'handsomearnold',
  database: 'myDataBase'
  //host: 'us-cdbr-iron-east-05.cleardb.net',
  //user: 'be939aaa6a71f2',
  //password: '29e5efef',
  //database: 'heroku_6a2623ec533aa20'
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

app.get('/distinctData/Target/:Target/Type/:Type/Brand/:Brand/Model/:Model/Year/:Year/Ejection/:Ejection/Location/:Location/Price/:Price', (req, res) => {
  console.log("Fetching distinct data with: " + req.params)

  const connection = getConnection()

  const selectTarget = req.params.Target
  const selectBrand = req.params.Brand
  const selectModel = req.params.Model
  const selectYear = req.params.Year
  const selectEjection = req.params.Ejection
  const selectLocation = req.params.Location
  const selectPrice = req.params.Price




})

// SHOW DATA WITH SPECIFIC Type EX:(http://localhost:3003/data/American)
app.get('/data/DistinctTarget/:DistinctTarget/Type/:Type/Brand/:Brand/Model/:Model/Year/:Year/Ejection/:Ejection/Location/:Location/Price/:Price', (req, res) => {
  console.log("Fetching data with: " + req.params)

  // Setting connection to mysql
  const connection = getConnection()

  // Query String
  const selectDistinctTarget = req.params.DistinctTarget
  const selectType = req.params.Type
  const selectBrand = req.params.Brand
  const selectModel = req.params.Model
  const selectYear = req.params.Year
  const selectEjection = req.params.Ejection
  const selectLocation = req.params.Location
  const selectPrice = req.params.Price

  const queryAttributeURLArray = [selectType, selectBrand, selectModel, selectYear, selectEjection, selectLocation]//, selectPrice]
  const queryAttributeString = ["Type","Brand","Model","Year","Ejection","Location"]//,"Price"]
  var queryStringData = []
  var firstElement = true
  var queryString = "SELECT * FROM hundredthousand"//Type = ? AND Year = ?"

  if (selectDistinctTarget != "NS") { // NS = "Not Specified"
    queryString = "SELECT DISTINCT " + selectDistinctTarget + " FROM hundredthousand"
  }

  for (i = 0; i < queryAttributeURLArray.length - 1; i++) {
    if (queryAttributeURLArray[i] != "NS") { // NS = "Not Specified"
      queryStringData.push(queryAttributeURLArray[i])
      if (firstElement) {
        queryString += (" WHERE " + queryAttributeString[i] + " = ?")
        firstElement = false
      }
      else {
        queryString += (" AND " + queryAttributeString[i] + " = ?")
      }
    }
  }

  // There's a range in pricing
  if (selectPrice != "NS") { 
    // Price format ex: 0|100, 0 = downbound, 100 = upbound
    if (firstElement) {
      queryString += (" WHERE ")
      firstElement = false
    }
    else {
      queryString += (" AND ")
    }
    const boundArray = selectPrice.split("|")
    const upbound = boundArray[1]
    const downbound = boundArray[0]
    queryString += "cast(Price as signed) <= " + upbound + " AND cast(Price as signed) >= " + downbound
  }

  connection.query(queryString, queryStringData, (err, rows, fields) => {

    if (err) {
      console.log("Failed to query for select type: "+ err)
      res.sendStatus(500)
      return
    }

    console.log("Fetch data successful, got " + rows.length + " data")
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
app.listen(PORT, '0.0.0.0',() => {
  console.log("Server is up and listening on: " + PORT)
})
