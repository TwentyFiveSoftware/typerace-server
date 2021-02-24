import * as express from 'express';
import * as http from 'http';
import socketServer from './socketServer';

const PORT = process.env.PORT || 5000;

const app = express();
const server = new http.Server(app);
socketServer(server);

app.get('/', (req, res) => res.send(Date()).status(200));

server.listen(PORT, () => console.log(`Server is listening on port ${PORT}!`));
