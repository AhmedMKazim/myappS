var express = require('express');
var router = express.Router();
const User = require('../models/User.model');
const verifyUserToken = require('./verifyUserToken');
const verifySuperUserToken = require('./verifySuperUserToken');
const verifyActiveUser = require('./verifyActiveUser');
const UserModel = require('../models/User.model');

router.get('/list',verifyUserToken, verifyActiveUser, verifySuperUserToken,  (req, res) => {
  if (!req.user) return res.status(400).json({error: 'this data for users only'});
  const user = new User();
  user.collection.find({}).toArray(function(err, result) {
    if (err) throw err;
    res.json(result);
  });
});
router.delete('/delete', verifyUserToken, verifyActiveUser, verifySuperUserToken, async (req, res) => {
  const user = await User.findOne({_id: req.body._id});
  if (!user) return res.status(400).json({error: 'Your id is invalid'});
  await user.remove();
  res.json({message: 'User deleted'});
});
module.exports = router;
