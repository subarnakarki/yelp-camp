/* eslint-disable no-console */
const express = require('express');
const Campground = require('../models/campground');

const router = express.Router();

// eslint-disable-next-line consistent-return
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function checkCampgroundOwnership(req, res, next) {
  if (req.isAuthenticated()) { // Validate the the user is logged in
    Campground.findById(req.params.id, (err, foundCampground) => {
      if (err) {
        res.redirect('/back ');
      // eslint-disable-next-line no-underscore-dangle
      } else if (foundCampground.author.id.equals(req.user._id)) {
        next();
      }
    });
  } else {
    res.redirect('back');
  }
}

// Index - Shows all campgrounds
router.get('/', (req, res) => {
  Campground.find({}, (err, allCampgrounds) => {
    if (err) {
      console.log(err);
    } else {
      res.render('campgrounds/index', { campgrounds: allCampgrounds });
    }
  });
});

// CREATE campground
router.post('/', isLoggedIn, (req, res) => {
  const newCampground = {
    name: req.body.name,
    image: req.body.image,
    description: req.body.description,
    author: {
      // eslint-disable-next-line no-underscore-dangle
      id: req.user._id,
      username: req.user.username,
    },
  };
  // eslint-disable-next-line no-unused-vars
  Campground.create(newCampground, (err, newlyCreated) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/campgrounds');
    }
  });
});

// New campground form
router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

// SHOW ROUTE - shows info about one campground
router.get('/:id', (req, res) => {
  Campground.findById(req.params.id).populate('comments').exec((err, foundCampground) => {
    if (err) {
      console.log(err);
    } else {
      res.render('campgrounds/show', { campground: foundCampground });
    }
  });
});


// EDIT CAMPGROUND
router.get('/:id/edit', checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    res.render('campgrounds/edit', { campground: foundCampground });
  });
});

// UPDATE CAMPGROUND ROUTE
router.put('/:id', checkCampgroundOwnership, (req, res) => {
  // Find and update the correct campground and redirect it to show page
  // eslint-disable-next-line no-unused-vars
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, campground) => {
    if (err) {
      res.redirect('/campgrounds');
    } else {
      res.redirect(`/campgrounds/${req.params.id}`);
    }
  });
});


// DESTROY ROUTE
router.delete('/:id', checkCampgroundOwnership, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      res.redirect('/campgrounds');
    } else {
      res.redirect('/campgrounds');
    }
  });
});

module.exports = router;
