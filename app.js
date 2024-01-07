const express = require('express');
const app = express();
const port = 3000;

// Serve i file statici dalla cartella 'public'
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server in ascolto su http://localhost:${port}`);
});
