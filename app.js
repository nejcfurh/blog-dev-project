'use strict';

//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require('lodash');
const mongoose = require('mongoose');

const username = require(__dirname + "/auth.js").username;
const password = require(__dirname + "/auth.js").password;

const homeStartingContent =
  'Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.';
const aboutContent =
  'This website was created under the guidance of Angela Yu and her "The Complete 2023 Web Development Bootcamp" on Udemy. This mini project took us through using node modules, how to navigate MongoDB databases, collections and using the items in the collections and rendering them on the website. Base of the app is Express.JS, database is MongoDB.';
const contactContent =
  'As the creator of the website and aspiring Junior Software Engineer I am open to any opportunities for cooperation and employment. Please do not hesitate to contact me directly via my email, or my social media.';

const app = express();

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.aoaflww.mongodb.net/?retryWrites=true&w=majority"`, {useNewUrlParser: true})
}

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
})

const Post = mongoose.model("Post", postSchema);

app.get("/", async function(req, res) {
  try {
    const posts = await Post.find({});
    res.render("home", {
      home: homeStartingContent,
      posts: posts
    });
  } catch (err) {
    console.error(err);
  }
});

app.get('/contact', (req, res) => {
  res.render('contact', { contact: contactContent });
});

app.get('/about', (req, res) => {
  res.render('about', { about: aboutContent });
});

app.get('/compose', (req, res) => {
  res.render('compose');
});

app.post("/compose", (req, res) => {
  const post = new Post ({
    title: req.body.title,
    content: req.body.post,
  })
  post.save().then(() => console.log("Post saved successfully!")).catch(err => {res.status(400).send("Unable to save post to database!")});
  res.redirect('/');
})

app.get('/posts/:postId', (req, res) => {
  const requestedPostId = (req.params.postId);
  
  Post.findOne({_id: requestedPostId}).then((foundPost) => {
    res.render("post", {title: foundPost.title, content: foundPost.content});
  })
});


app.listen(3000, function () {
  console.log('Server started on port 3000');
});