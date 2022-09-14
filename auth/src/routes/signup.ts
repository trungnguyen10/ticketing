import express, { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import { User } from '../models/user';
import { RequestValidationError } from '../errors/request-validation-errors';
import { BadRequestError } from '../errors/bad-request-error';
import { validateRequest } from '../middlewares/validate-request';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new BadRequestError('Email is in use'));
    }

    const user = User.build({
      email,
      password,
    });
    await user.save();

    // sign jwt for user
    const token = jwt.sign(
      { id: user.id, email: user.email },
      `${process.env.JWT_KEY}`
    );
    req.session = { jwt: token };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
