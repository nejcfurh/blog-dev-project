'use strict';

//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require('lodash');
const mongoose = require('mongoose');
const client = require('@mailchimp/mailchimp_marketing');

const username = require(__dirname + "/auth.js").username;
const password = require(__dirname + "/auth.js").password;

const homeStartingContent =
  `This website was created under the guidance of Angela Yu and her Complete 2023 Web Development Bootcamp on Udemy. This mini project took us through using node modules, how to navigate MongoDB databases, collections and using the items in the collections and rendering them on the website using EmbeddedJS (EJS). 
  
  The back-end of the app is Express.JS, the database is MongoDB and front-end is EJS with Bootstrap. The Contact Form is done via MailChimp email as a proof of concept.`

const aboutContent =
  `I'm a passionate and dedicated Junior Software Engineer eager to contribute my skills and enthusiasm to innovative projects. 
  
  With a solid foundation in programming languages like JavaScript (EJS, jQuerry, Node.JS, React.JS), and HTML/CSS coupled with my hands-on experience in building web applications and exploring emerging technologies, I'm excited about the opportunity to collaborate and learn from experienced professionals in the field. 
  
  I am proactive, detail-oriented, and committed to continuous improvement.`

const contactContent = "As the creator of the website and aspiring Junior Software Engineer I am open to any opportunities for cooperation and employment. Please do not hesitate to contact me directly via my email, or my social media - alternatively, you can fill the contact form below."

const app = express();

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.aoaflww.mongodb.net/dailyJournal`, {useNewUrlParser: true})
}

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  date: Number,
  author: String,
  imageLink: String,
})

const Post = mongoose.model("Post", postSchema);

// Get posts from DB

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

// Contact page

app.get('/contact', (req, res) => {
  res.render('contact', { contact: contactContent });
});

// About page

app.get('/about', (req, res) => {
  res.render('about', { about: aboutContent });
});

// Compose posts

app.get('/compose', (req, res) => {
  res.render('compose');
});

app.post("/compose", (req, res) => {
  const post = new Post ({
    title: req.body.title,
    content: req.body.post,
    date: Date.now(),
    author: req.body.author,
    imageLink: req.body.imageLink
  })

  if(post.title === "" || post.content === "" || post.author === "") return console.log("Post cannot have an empty title or content!"), res.redirect("/")
  
  post.save()
  .then(() => {
    console.log("Post saved successfully!", post.title, post.date);
    res.redirect('/');
  })
  .catch(err => {
    res.status(500).send("Unable to save post to database due to: " + err.message);
  });
})

// Read posts

app.get('/posts/:postId', (req, res) => {
  const requestedPostId = (req.params.postId);
  
  Post.findOne({_id: requestedPostId}).then((foundPost) => {
    res.render("post", {title: foundPost.title, content: foundPost.content, author: foundPost.author, date: foundPost.date, imageLink: foundPost.imageLink});
  })
});

// Delete posts

app.get('/:postId', (req, res) => {
  const postIdToDelete = req.params.postId

  Post.findOneAndDelete({ _id: postIdToDelete })
  .then(deletedPost => {
    if (deletedPost) {
      console.log('Post deleted successfully:', deletedPost.title);
      return res.redirect('/')
    } else {
      console.log('Post not found or already deleted');
    }
  })
  .catch(error => {
    console.error('Error deleting post:', error);
  });
})

// Email Contact Form

app.post('/send-email', function (req, res) {
  const name = req.body.name;
  const subject = req.body.subject;
  const email = req.body.email;
  const message = req.body.message;

  const data = {
    members: [
      {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          NAME: name,
          SUBJECT: subject,
          MESSAGE: message
        },
      },
    ],
  };

  // Create JSON data

  const jsonData = JSON.stringify(data);

  // Magic of MailChimp

  client.setConfig({
    apiKey: 'a27e8e2e9d0186a1780916371d0dcca8-us13',
    server: 'us13',
  });

  //Async function will send your data
  const run = async () => {
    const response = await client.lists.batchListMembers(
      'b2abdb1c75',
      jsonData
    );

    if (response.error_count === 0) {
      res.sendFile(__dirname + '/views/success.html');
    } else {
      res.sendFile(__dirname + '/views/failure.html');
    }
  };
  // Run the async function
  run();
});

// Failure Try Again

app.post('/failure', function (req, res) {
    res.redirect('/contact')
});

// Success back to home

app.post('/success', function (req, res) {
  res.redirect('/contact')
});

// Server running

app.listen(3000, function () {
  console.log('Server started on port 3000');
});