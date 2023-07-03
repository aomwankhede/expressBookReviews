const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  let username = req.query.username;
  let password = req.query.password;
  const obj = { username: username, password: password };
  if (username && password) {
    if (users.some(user => user.username === username && user.password === password)) {
      res.status(404).send("Username is taken")
    }
    else {
      users.push(obj);
      res.send("you are logged in!!")
    }
  }
  else {
    res.status(404).send("Username or password is undefined")
  }
});

// Get the book list available in the shop
let promise1 = new Promise((resolve, reject) => {
  public_users.get('/', function (req, res) {
    const j = JSON.stringify(books);
    res.send(j);
    resolve();
  });
});

promise1.then(() => {
  console.log("Resolved 1")
}).catch(() => {
  console.log("rejected 1")
})

// Get book details based on ISBN
let promise2 = new Promise((resolve, reject) => {
  public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const neededBook = books[isbn];
    console.log(neededBook);
    resolve();
    return res.status(200).json({ message: `The details of the book with ISBN ${isbn} is:${JSON.stringify(neededBook)}` });
  });
});

promise2.then(() => {
  console.log("Resolved 2");
}).catch(() => {
  console.log("Reject 2");
})

// Get book details based on author
let promise3 = new Promise((resolve, reject) => {
  public_users.get('/author/:author', function (req, res) {
    let needed = [];
    for (i in books) {
      if (books[i].author === (req.params.author)) {
        needed.push(books[i]);
        resolve();
      }
    }
    return res.status(200).json({ message: `The books needed are ${JSON.stringify(needed)}` });
  });
})

promise3.then(() => {
  console.log("resolved 3")
}).catch(() => {
  console.log("reject 3")
})

// Get all books based on title
let promise4 = new Promise((resolve, reject) => {
  public_users.get('/title/:title', function (req, res) {
    let needed = [];
    for (i in books) {
      if (books[i].title === (req.params.title)) {
        needed.push(books[i]);
        resolve();
      }
    }
    return res.status(200).json({ message: `The books needed are ${JSON.stringify(needed)}` });
  });
})

promise4.then(() => {
  console.log("resolved 4")
}).catch(() => {
  console.log("reject 4")
})
//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  let needed = books[req.params.isbn];
  return res.status(200).json({ message: `The book you chosen is ${JSON.stringify(needed.reviews)}` });
});

module.exports.general = public_users;
