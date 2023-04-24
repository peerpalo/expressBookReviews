const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registred. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }

    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    let promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(books);
        }, 500)
    });

    let result = await promise;

    // isn't better to return directly the JSON?
    res.send(result);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    let promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(Object.values(books).find((book) => book.isbn === isbn));
        }, 500)
    });

    let filtered_book = await promise;
    res.send(filtered_book);
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;

    let promise = new Promise((resolve) => {
        setTimeout(() => {
            resolve(Object.values(books).filter((book) => book.author === author));
        }, 500)
    });

    let filtered_books = await promise;
    res.send(filtered_books);
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;

    let promise = new Promise((resolve) => {
        setTimeout(() => {
            resolve(Object.values(books).find((book) => book.title === title));
        }, 500)
    });

    let filtered_book = await promise;
    res.send(filtered_book);
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    let filtered_reviews = Object.values(books).find((book) => book.isbn === isbn)?.reviews;
    res.send(filtered_reviews);
});

module.exports.general = public_users;
