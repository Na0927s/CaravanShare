import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import caravanRoutes from './routes/caravanRoutes';
import userRoutes from './routes/userRoutes'; // Import userRoutes
import reservationRoutes from './routes/reservationRoutes';
import reviewRoutes from './routes/reviewRoutes';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/caravans', caravanRoutes);
app.use('/api/auth', userRoutes); // Use userRoutes
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from CaravanShare Backend!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
