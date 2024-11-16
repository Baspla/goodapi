import express from 'express';
import logger from 'morgan';

import {router as indexRouter} from './routes/index.js';
import {router as usersRouter}  from './routes/users.js';
import {router as authRouter}  from './routes/auth.js';
import {PORT} from "./env.js";

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/auth', authRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.listen(PORT, () => {
    console.log('Server is running on http://localhost:3000');
});