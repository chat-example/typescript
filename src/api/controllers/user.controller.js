import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../constants/common.js';
import logger from '../../utils/logger.js';
import userService from '../services/user.service.js';
import prismaClient from '../../libs/prismaClient.js';
import dayjs from 'dayjs';
import passport from 'passport';
import UserDTO from '../dtos/user.dto.js';

class UserController {
  prismaClient;
  userService;
  logger;

  constructor({ logger, userService, prismaClient}) {
    this.logger = logger;
    this.userService = userService;
    this.prismaClient = prismaClient
  }

  async signInByEmail(req, res, next) {
    this.logger.debug('[signInByEmail] user email sign in start');
    passport.authenticate('local', (passportError, user, info) => {
      if (passportError || !user) {
        res.status(StatusCodes.BAD_REQUEST).json(info);
        return;
      }

      this.logger.debug(`[signInByEmail] user email sign in success ${user.id}`);
      req.login(user, { session: false }, (loginError) => {
        if (loginError) {
          res.status(StatusCodes.BAD_REQUEST).send(loginError);
          return;
        }

        const token = jwt.sign({ id: user.id, name: user.nickname }, JWT_SECRET)

        res.cookie('accessToken', token, { expires: dayjs().add(7, 'day').toDate(), httpOnly: true})
        res.status(StatusCodes.NO_CONTENT).send(ReasonPhrases.NO_CONTENT);
      });
    })(req, res, next);
  }

  async signUpByEmail(req, res, next) {
    try {
      const { email, password, nickname } = req.body;

      const user = await this.userService.create({ email, password, nickname, });

      this.logger.debug(`[signUpByEmail] User created with Id ${user.id}`)

      const token = jwt.sign({ id: user.id, name: user.nickname }, JWT_SECRET)

      res.cookie('accessToken', token, { expires: dayjs().add(7, 'day').toDate(), httpOnly: true})
      res.status(StatusCodes.CREATED).send(ReasonPhrases.CREATED);
    } catch (error) {
      this.logger.error(error);
      next(error);
    }
  }

  async authWithToken(req,res,next, callback) {
    this.logger.debug('[authWithToken] user jwt sign in start');
    passport.authenticate('jwt', (passportError, user, info) => {
      if (passportError || !user) {
        res.status(StatusCodes.BAD_REQUEST).json(info);
        return;
      }
      this.logger.debug(`[authWithToken] user jwt sign in success ${user.id}`);

      callback(user);
    })(req, res, next);
  }

  async updateWithToken(req, res, next) {
    this.authWithToken(req, res, next, (async (user) => {
      try {
        const userData = UserDTO.from({
          ...req.body,
          id: user.id
        });
  
        const updatedUser = await this.userService.update(userData);
        res.status(StatusCodes.OK).json(updatedUser);
      } catch (error) {
        this.logger.error(error);
        next(error);
      }
    }).bind(this));
  }
}

const userController = new UserController({logger, userService, prismaClient});

export default userController