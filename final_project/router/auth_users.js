const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username
    });
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password)
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    const review = req.query.review;

    if (!review) {
        return res.status(400).send("Missing review request query");
    }

    let filtered_book = Object.values(books).find((book) => book.isbn === isbn);

    if (!filtered_book) {
        return res.status(404).send("Book not found");
    }

    let filtered_review = Object.values(filtered_book.reviews).find((review) => review.username === username);
    
    if (filtered_review) {
        filtered_review.review = review;
        res.status(200).send("Review updated");
    } else {
        filtered_review =  { [Object.keys(filtered_book.reviews).length + 1]: { "username": username, review } };
        filtered_book.reviews = {...filtered_book.reviews, ...filtered_review};
        res.status(200).send("Review added");
    }
});

// Add a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    let filtered_book = Object.values(books).find((book) => book.isbn === isbn);

    if (!filtered_book) {
        return res.status(404).send("Book not found");
    }
    
    let filtered_review_index = Object.values(filtered_book.reviews).findIndex((review) => review.username === username);
    
    if (filtered_review_index > -1) {
        delete filtered_book.reviews[filtered_review_index + 1];
        res.status(200).send("Review deleted");
    }

    res.status(200);
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
