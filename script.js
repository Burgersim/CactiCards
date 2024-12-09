const express = require('express');
const {Pool} = require('pg');
const path = require('path');
const BodyParser = require('body-parser');

const app = express();
const port = 3000;

const pool = new Pool({
    user: 'cacticards_app_db_user',
    host: 'dpg-ctbcu3m8ii6s7380qak0-a',
    database: 'cacticards_app_db',
    password: 'xT7frdtpBtPdgINo7Y93nQlBLsMUDCOb',
    port: 5432,
})

app.use(express.static(path.join('')));
app.use(BodyParser.urlencoded({extended: false}));

// Setup Route Handler
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/cardList', (req, res) => {
    res.sendFile(path.join(__dirname, 'cardList.html'));
});

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

// Listening to requests
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});