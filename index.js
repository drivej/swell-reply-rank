const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, './dist')));

app.get('/', async (req, res) => {
  // res.render('home', { page: 'home' });
  res.sendFile(path.join(__dirname, './dist/index.html'));
});

const port = process.env.PORT || 9000;
app.listen(port, () => console.log('Running on port', port));
/*
if (process.env.PORT && !isNaN(process.env.PORT)) {
  app.listen(process.env.PORT, function () {
    console.log('Running on port', process.env.PORT);
  });
} else {
  const openport = require('openport');
  openport.find({ startingPort: 5000 }, function (err, port) {
    if (err) {
      console.log(err);
    } else {
      app.listen(port, function () {
        console.log('Running on port', port);
      });
    }
  });
}
*/