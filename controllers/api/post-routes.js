const router = require('express').Router();
const withAuth = require('../../utils/auth');
const sequelize = require('../../config/connection');
const { Post, User, Comment} = require('../../models');

// GET all posts
router.get('/', (req, res) => {
  console.log('======================');
  Post.findAll({
    // Query configuration
    attributes: ['id', 
                 'post_text',
                 'title',
                 'created_at'
              ],
    // show latest news first
    order: [['created_at', 'DESC']],
    // JOIN to the User table
    include: [
        // comment model -- attaches username to comment 
        {
          model: Comment,
          attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
          include: {
            model: User,
            attributes: ['username']
          }
        },
        {
          model: User,
          attributes: ['username']
        },
    ]
  }) 
      .then(dbPostData => res.json(dbPostData))
      .catch(err => {
          console.log(err);
          res.status(500).json(err);
      });

});

// GET a single post by id 
router.get('/:id', (req, res) => {
  Post.findOne({
    where: {
      id: req.params.id
    },
    attributes: ['id', 
                 'post_text', 
                 'title',
                 'created_at'
              ],
    include: [
      {
        model: User,
        attributes: ['username']
      },
      {
        model: Comment,
        attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
        include: {
          model: User,
          attributes: ['username']
        }
      }
    ]
  })
    .then(dbPostData => {
      if (!dbPostData) {
        res.status(404).json({ message: 'No post found with this id' });
        return;
      }
      res.json(dbPostData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Create a post
router.post("/", withAuth, (req, res) => {
  console.log("creating");
  Post.create({
          title: req.body.title,
          content: req.body.post_content,
          user_id: req.session.user_id
      })
      .then((dbPostData) => res.json(dbPostData))
      .catch((err) => {
          console.log(err);
          res.status(500).json(err);
      });
});

// UPDATE a post
router.put('/:id', withAuth, (req, res) => {
  Post.update({
      title: req.body.title,
      post_text: req.body.post_text
    },
    {
      where: {
        id: req.params.id
      }
  }).then(dbPostData => {
      if (!dbPostData) {
          res.status(404).json({ message: 'No post found with this id' });
          return;
      }
      res.json(dbPostData);
  })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
  });
});

// ===================================================================================================
// ===================================================================================================
// ===================================================================================================
// ===================================================================================================


router.delete('/:id', withAuth, async (req, res) => {
  try {
    const projectData = await Project.destroy({
      where: {
        id: req.params.id,
        user_id: req.session.user_id,
      },
    });

    if (!projectData) {
      res.status(404).json({ message: 'No project found with this id!' });
      return;
    }

    res.status(200).json(projectData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

// DELETE A post 
router.delete('/:id', withAuth, (req, res) => {
  Post.destroy({
      where: {
          id: req.params.id 
      }
  }).then(dbPostData => {
      if (!dbPostData) {
          res.status(404).json({ message: 'No post found with this id' });
          return;
      }
      res.json(dbPostData);
  }).catch(err => {
      console.log(err);
      res.status(500).json(err);
  });
});

module.exports = router;
