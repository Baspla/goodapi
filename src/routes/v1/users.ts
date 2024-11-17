import express, {NextFunction, Request, Response} from 'express';
import {getUserById, getUsers} from "../../db/operations/users.js";
import {getRecommendationsByUserId} from "../../db/operations/recommendations.js";
export var router = express.Router();

/* GET users listing. */
router.get('/', function(req: Request, res: Response, next: NextFunction) {
  getUsers().then(users => {
    res.json({ users });
  }).catch(next);
});

router.get('/:id', function(req: Request, res: Response, next: NextFunction) {
  getUserById(parseInt(req.params.id)).then(user => {
    if (user) {
      res.json({ user });
    } else {
        throw { status: 404, message: 'User not found' };
    }
  }).catch(next);
});

router.get('/:id/recommendations', function(req: Request, res: Response, next: NextFunction) {
    getRecommendationsByUserId(parseInt(req.params.id)).then(recommendations => {
      res.json({ recommendations });
    } ).catch(next);
});