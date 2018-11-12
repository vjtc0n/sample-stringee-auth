const mongoose = require('mongoose');

const Room = mongoose.model('Room', {
  nameRoom: String,
  user1_phone: String,
  user2_phone: String,
  startTime: String,
  endTime: String
});
module.exports = Room;
