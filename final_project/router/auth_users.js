const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

regd_users.use(express.json());

let users = [];

const isValid = (username) => {
  return !/[1-9]|10/.test(username);
};


const authenticatedUser = (username, password) => {
  for (const user of users) {
    if (user.username === username && user.password === password) {
      return true;
    }
  }
  return false;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  let username = req.query.username;
  let password = req.query.password;
  if (username && password) {
    if (authenticatedUser(username, password) == true) {
      const user = users.find(user => user.username === username && user.password === password);
      const payload = { username: user.username };
      const token = jwt.sign(payload, 'This is a secret code:)');
      user.token = token;
      res.json({ token: token });
    } else {
      res.status(401).send("Invalid credentials");
    }
  }
  else {
    res.status(401).json({ message: 'username or password is missing' });
  }
});

// Add a book review
regd_users.put("/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, 'This is a secret code:)', (err, decodedToken) => {
      if (err) {
        res.status(401).json("Token not valid!!");
      } else {
        const username = decodedToken.username;
        let arr = books[isbn].reviewers
        const user = arr.find(Obj => Obj.username === username);
        if (user) {
          user.review = req.body.review;
          res.json({ message: "modified" })
        }
        else {
          arr.push({ username: username, review: req.body.review });
          console.log(books[isbn].reviewers)
          res.json({ message: "review added" })
        }
      }
    })
  } else {
    res.status(401).json("Token not found!!");
  }
});

regd_users.delete("/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, 'This is a secret code:)', (err, decodedToken,) => {
      const username = decodedToken.username;
      let arr = books[isbn].reviewers;
      let requiredReview = arr.filter((obj) => {
        return obj.username === username;
      })
      if (requiredReview.length <= 0) {
        res.send('You haven,t reviewed yet!!')
      }
      else {
        let t = books[isbn].reviewers.filter((obj) => {
          return obj.username != username;
        })
        books[isbn].reviewers = t;
        console.log(books[isbn].reviewers);
        res.send("Successfully deleted");
      }
    });
  } else {
    res.send("No token found")
  }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
