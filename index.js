const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const mysql = require("mysql2/promise");

app.use(bodyParser.json());
app.use(cors());
const port = 9000;
let books = [];

const validateData = (bookData) => {
  let errors = []
  if(!bookData.title){
      errors.push('กรุณากรอกชื่อหนังสือ')
  }   
  if(!bookData.author){
      errors.push('กรุณากรอกชื่อผู้แต่ง')
  }
  if(!bookData.publisher){
      errors.push('กรุณากรอกชื่อสำนักพิมพ์')
  }
  if(!bookData.category){
      errors.push('กรุณาเลือกประเภทหนังสือ')
  }
  if(!bookData.year){
      errors.push('กรุณากรอกปีที่พิมพ์')
  }

  return errors
}

const initMySQL = async () => {
  conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "webdb",
    port: 8830,
  });
};

app.get("/books", async (req, res) => {
  const results = await conn.query("SELECT * FROM books");
  res.json(results[0]);
});
  
app.post("/books", async (req, res) => {
  try {
    let book = req.body;
    const errors = validateData(book)
    if(errors.length > 0){
        throw{
            message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
            errors: errors
        }
    }
    const results = await conn.query("INSERT INTO books SET ?", book);
    res.json({
      message: "book created completely",
      data: results[0],
    });
  } catch (error) {
    const errorMessage = error.message || 'something went wrong'
    const errors = error.errors || []
    console.error("errorMessage", error.message);
    res.status(500).json({ 
      error: errorMessage, 
      error: errors
    })
  }
});


app.get("/books/:id", async (req, res) => {
  try {
    let id = req.params.id;
    const results = await conn.query("SELECT * FROM books WHERE id = ?", id);
    if (results[0].length == 0) {
      throw { statusCode: 404, message: "Book not found" };
    }
    res.json(results[0][0]);
  } catch (error) {
    console.error("errorMessage", error.message);
    res.status(500).json({
      message: "something went wrong",
      errorMessage: error.message,
    });
  }
});

app.put("/book/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let updatedBook = req.body;
    let book = req.body;
    const results = await conn.query("UPDATE books SET ? WHERE id = ?", [
      updatedBook,
      id,
    ]);
    res.json({
      message: "Book updated completely",
      data: results[0],
    });
  } catch (error) {
    console.error("errorMessage", error.message);
    res.status(500).json({
      message: "something went wrong",
      errorMessage: error.message,
    });
  }
});

app.delete("/book/:id", async(req, res) => {
  try {
    let id = req.params.id;
    const results = await conn.query("DELETE From books WHERE id = ?", id);
    res.json({
      message: "Delete book completely",
      data: results[0],
    });
  } catch (error) {
    console.error("errorMessage", error.message);
    res.status(500).json({
      message: "something went wrong",
      errorMessage: error.message,
    });
  }
});

app.listen(port, async (req, res) => {
  await initMySQL();
  console.log(`Server is running on port ${port}`);
});
