import express, {NextFunction, Request, Response} from 'express';
import {getRedactedUserById, getRedactedUsers, getUserById, getUsers} from "../../db/operations/users.js";
import {getRecommendationsByUserId} from "../../db/operations/recommendations.js";
export var router = express.Router();

router.get('/', async function(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await getRedactedUsers();
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

router.get('/:id/recommendations', async function(req: Request, res: Response, next: NextFunction) {
  try {
    const recommendations = await getRecommendationsByUserId(parseInt(req.params.id));
    res.json({ recommendations });
  } catch (error) {
    next(error);
  }
});