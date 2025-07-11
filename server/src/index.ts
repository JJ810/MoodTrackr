import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import config from './config';
import apiRoutes from './routes';
import { initializeSocketIO } from './services/socketService';

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));
app.use(helmet());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello World from MoodTrackr API!' });
});

app.use('/api', apiRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = config.port;

initializeSocketIO(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
  console.log(`WebSocket server initialized`);
});
