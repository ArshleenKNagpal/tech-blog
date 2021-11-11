const router = require('express').Router();
const { User, Post, Comment } = require('../../models');

// GET /api/users
router.get('/',  (req, res) => {
  // access our user model and run .findAll() method -- similar to SELECT * FROM users;
  User.findAll({
      attributes: { exclude: ['[password']}
  })
  .then(dbUserData => res.json(dbUserData))
  .catch(err => {
      console.log(err); 
      res.status(500).json(err);
  });
});

// GET a single user by id 
router.get('/:id', (req, res) => {
  User.findOne({
      attributes: { exclude: ['password'] },
      where: {
        id: req.params.id
      },
      include: [
        {
          model: Post,
          attributes: ['id', 'title', 'post_text', 'created_at']
        },
        {
          model: Comment,
          attributes: ['id', 'comment_text', 'created_at'],
          include: {
            model: Post,
            attributes: ['title']
          }
        }
      ]
    })
      .then(dbUserData => {
          if (!dbUserData) {
              res.status(404).json({ message: 'No user found with this id'});
              return;
          }
          res.json(dbUserData);
      })
      .catch(err => {
          console.log(err);
          res.status(500).json(err);
      });
});

// Create a user
router.post('/', (req, res) => {
  User.create({
          username: req.body.username,
          password: req.body.password
      })
      .then(dbUserData => {
          req.session.save(() => {
              req.session.user_id = dbUserData.id;
              req.session.username = dbUserData.username;
              req.session.loggedIn = true;

              res.json(dbUserData);
          });
      })
      .catch(err => {
          console.log(err);
          res.status(500).json(err);
      });
})

// LOG IN for users/ verify users 
router.post('/login', (req, res) => {
  User.findOne({
          where: {
              username: req.body.username
          }
      }).then(dbUserData => {
          if (!dbUserData) {
              // json message does not appear
              res.status(400).json({ message: 'No user with that username!' });
              return;
          }
          const validPassword = dbUserData.checkPassword(req.body.password);

          if (!validPassword) {
              res.status(400).json({ message: 'Incorrect password!' });
              return;
          }
          req.session.save(() => {

              req.session.user_id = dbUserData.id;
              req.session.username = dbUserData.username;
              req.session.loggedIn = true;

              res.json({ user: dbUserData, message: 'You are now logged in!' });
          });
      })
      .catch(err => {
          console.log(err);
          res.status(500).json(err);
      });
});

// LOGOUT for users
router.post('/logout', (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;