import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest } from '../middlewares/validate-request';
import { User } from '../models/user';
import { BadRequestError } from '../errors/bad-request-error';
import { Password } from '../services/password';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('A valid email must be provided.'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be provided.'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // find the user with given email
    const user = await User.findOne({ email });

    if (!user) {
      throw new BadRequestError('Bad credentials');
    }

    // compares hashed passwords
    if (!(await Password.compare(user.password, password))) {
      throw new BadRequestError('Bad credentials');
    }

    // issue jwt
    const token = jwt.sign(
      { id: user.id, email: user.email },
      `${process.env.JWT_KEY}`
    );
    req.session = { jwt: token };

    res.status(200).send(user);
  }
);

export { router as signinRouter };
