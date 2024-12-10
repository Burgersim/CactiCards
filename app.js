const express = require('express');
const {Pool} = require('pg');
const path = require('path');
const BodyParser = require('body-parser');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
const port = 3000;
const pages = [
    ["/", "public/html/index.html"],
    ["/login", "public/html/login.html"],
    ["/profile", "public/html/profile.html"],
    ["/cardList", "public/html/cardList.html"],
]

const pool = new Pool({
    user: 'cacticards_app_db_user',
    host: 'dpg-ctbcu3m8ii6s7380qak0-a',
    database: 'cacticards_app_db',
    password: 'xT7frdtpBtPdgINo7Y93nQlBLsMUDCOb',
    port: 5432,
})

app.use(express.static(path.join('')));
app.use(BodyParser.urlencoded({extended: false}));

//Middleware to pass json bodies
app.use(express.json());
app.use(morgan('dev'));

// Generic Page Handler Loop
pages.forEach(pages =>{
    // GET method route
    app.get(pages[0], (req, res) => {
      res.sendFile(__dirname + "/" + pages[1])
    })
  })
  
  
/*
// Setup Route Handler
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

// Route Handler to Login/Register Page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/login.html'));
});

// Route Handler to CardList
app.get('/cardList', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/cardList.html'));
});
*/

// Route Handler to get List of Cards
app.get('/cards', (req, res) => {
    const query = 'SELECT * FROM cards';

    pool.query(query, (error, result) => {
        if (error) {
            console.error('Error occurred:', error);
            res.status(500).send('An error occurred while retrieving data from the database.');
        } else {
            const cards = result.rows;
            res.json(cards);
        }
    });
});

// Route Handler to get Collected Cards
app.get('/collected_cards', (req, res) => {
    const query = 'SELECT * FROM collected_cards WHERE user_id = 1003';

    pool.query(query, (error, result) => {
        if (error) {
            console.error('Error occurred:', error);
            res.status(500).send('An error occurred while retrieving data from the database.');
        } else {
            const cards = result.rows;
            res.json(cards);
        }
    });
});

// Route Handler for registering new users
app.post('/register', async (req, res) => {
    console.log("Register Request:", req.body);
    const user = req.body;

    // Hash user's password, and set hashed password as user's password in the request
    user.password = bcrypt.hashSync(user.password, saltRounds);

    try {
        const query = 'INSERT INTO users (username, email, pass) VALUES ($1, $2, $3) RETURNING *'
        const values = [user.username, user.email, user.password];
        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch(err) {
        console.error('Error occurred:', err);
        res.status(500).send('An error occurred while registering the user.');}
})

// Route Handler for Logging in
app.post('/login', async (req, res) => {
    console.log("Login Request:", req.body);
    const user = req.body;

    try{
        const query = 'SELECT * FROM users WHERE email = $1'
        const values = [user.email];
        const result = await pool.query(query, values);
        console.log("Result:", result.rows[0]);
        if (bcrypt.compareSync(user.password, result.rows[0].pass)) {
            console.log("Passwords match!");
            res.json({result: 'success'});
        } else {
            console.log("Passwords do not match!");
            res.json({result: 'fail'});
        }
    } catch(err) {
        console.error('Error occurred:', err);
        res.status(500).send('An error occurred while logging in the user.');
    }

})

// Everything else
// Handling non matching request from the client 
app.use((req, res, next) => { 
    res.status(404).send( 
        "<h1>Page not found on the server</h1>") 
}) 

// Listening to requests
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});