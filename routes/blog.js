const {Router} = require('express');
const Blog = require('../models/blog');
const multer = require('multer');
const path = require('path');
const Comment = require('../models/comment');
const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads'))
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`
        cb(null, fileName);
    }
  })
  
const upload = multer({ storage: storage })

router.get('/add-new', (req, res) => {
    res.render('addBlog', {
        user: req.user,
    });
})

router.post('/', upload.single('coverImage'), async (req, res) => {
    try {
        const { title, body } = req.body;
        const blog = await Blog.create({
          title,
          body,
          createdBy: req.user._id,
          coverImageURL: `uploads/${req.file.filename}`,
        });
        return res.redirect(`blog/${blog._id}`);
      } catch (err) {
        console.error('Error creating blog:', err); // Logs the error
        return res.status(500).send('Internal Server Error');
      }
})

router.get('/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate('createdBy');
    // console.log(blog);
    const comments = await Comment.find({blogId: req.params.id}).populate('createdBy');
    
    return res.render('blog', {
        user: req.user,
        blog,
        comments,
    })
})

router.post('/comment/:blogId', async (req, res) => {
    await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id,
    })

    return res.redirect(`/blog/${req.params.blogId}`);
})

module.exports = router;