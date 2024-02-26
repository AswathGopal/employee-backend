const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors =require('cors');
const jwt = require('jsonwebtoken')
const app = express();
require('dotenv').config();
const port = 8000;
app.use(cors({
     origin:['https://library-management-frontend-ten.vercel.app/'],
    methods:['GET','POST','PUT','DELETE'],
    credentials: true
}))
// Create MySQL connection
const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Routes
app.get('/',(req,res)=>{
  res.send('working')
})
app.post('/submit', (req, res) => {
  const { name, id, department, dob, gender, designation, salary } = req.body;
 console.log(req.body)
  // Validation
  if (!name || !id || !department || !dob || !gender || !designation || !salary) {
    return res.status(400).send('Please fill in all fields');
  }

  if (name.length > 30) {
    return res.status(400).send('Name must be within 30 characters');
  }

  if (salary.length > 8) {
    return res.status(400).send('Salary must be within 8 digits');
  }

  // Insert into database
  const sql = `INSERT INTO employees (name, employee_id, department, dob, gender, designation, salary) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  connection.query(sql, [name, id, department, dob, gender, designation, salary], (err, result) => {
    if (err) throw err;
    console.log('Employee added to database');
    res.status(200).send('Employee added successfully');
  });
});

app.get('/employee',(req,res)=>{
    const sql="SELECT * FROM employees";
    connection.query(sql,(err,result)=>{
        if(err) return res.json({Status:false,Error:"Query Error"})
        return res.json({Status:true,Result:result})
    })
})
app.get('/library',(req,res)=>{
    const sql="SELECT * FROM books";
    connection.query(sql,(err,result)=>{
        if(err) return res.json({Status:false,Error:"Query Error"})
        return res.json({Status:true,Result:result})
    })
})

app.post('/adminlogin',(req,res)=>{
  console.log(req.body)
    const sql = "SELECT * FROM admin WHERE email = ? and password = ?"
    connection.query(sql,[req.body.email,req.body.password],(err,result)=>{
        if(err) console.log(err)
        console.log(err)
        if(result.length>0){
            console.log("result",result)
            const email = result[0].email;
            const token = jwt.sign({
                role:"admin",
                email:email 
            },
            "jwt_secret_key",
            {expiresIn:"1d"}
            );
            res.cookie('token',token)
            res.status(200).json({"LoginStatus":true,"message":"sucessfully logged in"})
        }
        else{
            res.send({"LoginStatus":false,"message":"wrong email or password"})
        }
    })
})

app.get('/logout',(req,res)=>{
    res.clearCookie('token')
    return res.json({Status:true})
})

app.delete('/delete_employee/:id',(req,res)=>{
    const id = req.params.id;
    const sql = "delete from employees where employee_id=?"
    connection.query(sql,[id],(err,result)=>{
      if(err) console.log(err);
      return res.json({Status:true,Result:result})  
      
    })
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
