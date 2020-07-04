const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String},
  email: { type: String},
  phone:{ type: String},
  active: {type: Boolean, default: false},
  super_user: {type: Boolean, default: false},
  password: { type: String},
},
{
  timestamps: true
}
);

module.exports = mongoose.model('Users', UserSchema);
