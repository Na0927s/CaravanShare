import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import caravanRoutes from './routes/caravanRoutes';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/caravans', caravanRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from CaravanShare Backend!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
