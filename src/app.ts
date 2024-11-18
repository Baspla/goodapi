import express, {Request, Response} from 'express';
import logger from 'morgan';


import {PORT} from "./env.js";
import {processAuth} from "./middleware/auth.js";
import {v1router} from "./routes/v1.js";

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(processAuth);

app.use('/v1',v1router);

// catch 404 and forward to error handler
app.use(function (req: Request, res:Response) {
    res.status(404).json({error: 'Not Found'});
});

// error handler

app.use(function (err: any, req: Request, res: Response) {
    res.status(err.status || 500).json({error: err.message});
});

app.listen(PORT, () => {
    console.log('Server is running on http://localhost:3000');
});