import express, {NextFunction, Request, Response} from 'express';
import {getRedactedUserById, getRedactedUserWithStatsById, getUsers} from "../../db/operations/users.js";
import {getFindsByUserId} from "../../db/operations/finds.js";
export var router = express.Router();

router.get('/', async function(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await getUsers();
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async function(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getRedactedUserById(parseInt(req.params.id));
    if (user) {
      res.json({ user });
    } else {
      throw { status: 404, message: 'User not found' };
    }
  } catch (error) {
    next(error);
  }
});

router.get('/:id/stats', async function(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await getRedactedUserWithStatsById(parseInt(req.params.id));
        if (user) {
            res.json({ user });
        }else {
            throw { status: 404, message: 'User not found' };
        }
    } catch (error) {
        next(error);
    }
});

router.get('/:id/finds', async function(req: Request, res: Response, next: NextFunction) {
  try {
    const finds = await getFindsByUserId(parseInt(req.params.id));
    res.json({ finds });
  } catch (error) {
    next(error);
  }
});