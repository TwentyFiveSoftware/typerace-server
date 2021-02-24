import * as express from 'express';
import * as http from 'http';

const PORT = process.env.PORT || 5000;

const app = express();
const server = new http.Server(app);

app.get('/', (req, res) => res.send(Date()).status(200));

server.listen(PORT, () => console.log(`Server is listening on port ${PORT}!`));
