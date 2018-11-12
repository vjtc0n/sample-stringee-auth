const OneSignal = require('onesignal-node');
const myClient = new OneSignal.Client({
  userAuthKey: 'MmJjNWFlMzMtMTdiNi00NjYxLTgxNTctMjY4NDQ5ZjQwZjIy',
  // note that "app" must have "appAuthKey" and "appId" keys
  app: {
    appAuthKey: 'MmJjNWFlMzMtMTdiNi00NjYxLTgxNTctMjY4NDQ5ZjQwZjIy',
    appId: 'db98a1f2-8f88-4483-ae19-abd36a8594b3'
  }
});
module.exports = myClient;
