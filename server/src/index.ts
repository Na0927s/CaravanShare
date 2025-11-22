import "reflect-metadata"; // Should be imported at the very top of your application
import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import caravanRoutes from './routes/caravanRoutes';
import userRoutes from './routes/userRoutes';
import reservationRoutes from './routes/reservationRoutes';
import reviewRoutes from './routes/reviewRoutes';
import { AppDataSource } from './data-source'; // Import AppDataSource

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/caravans', caravanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from CaravanShare Backend!');
});

// Initialize TypeORM Data Source and start the server
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => console.error("Error during Data Source initialization:", error));
