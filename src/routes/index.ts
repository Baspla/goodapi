import express, { Request, Response } from 'express';
export var router = express.Router();

/* GET home page. */
router.get('/', function(req: Request, res: Response, next: () => void){
  res.json({ ok: true });
});
