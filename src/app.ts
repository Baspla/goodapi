import express, {NextFunction, Request, Response} from 'express';
import logger from 'morgan';
import cors from "cors";


import {NODE_ENV, PORT, VERSION} from "./env.js";
import {processAuth} from "./middleware/auth.js";
import v1 from "./routes/v1.js";
import path from "node:path";


const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());
app.use(processAuth);

console.log('Current working directory:', process.cwd());
console.log('Current static directory:', path.join(process.cwd(), 'docs'));

app.use('/docs', express.static(path.join(process.cwd(), 'docs')));

app.use('/v1',v1);

// catch 404 and forward to error handler
app.use(function (req: Request, res:Response) {
    res.status(404).json({error: 'Not Found'});
});

// error handler
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
    if(res.headersSent){
        return next(err);
    }
    res.status(err.status || 500);
    res.json({error: err.message});
});

app.listen(PORT, () => {
    console.log('Server is reachable on http://localhost:3000');
    console.log('Server is running on version', VERSION, 'in', NODE_ENV, 'mode');
});