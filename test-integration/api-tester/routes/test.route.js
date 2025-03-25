const { Router } = require('express');
const {
  loginUserWithCredentials,
  createUser,
  activateUser,
  getMe,
} = require('../controllers/auth.controller');
const {
  createPassword,
  getPassword,
  getAllPasswords,
} = require('../controllers/password.controller');

const { authenticate } = require('../middlewares/auth.middleware');

const testRouter = Router();

testRouter.get('/me', authenticate, getMe);
testRouter.post('/auth/register', createUser);
testRouter.post('/auth/login', loginUserWithCredentials);
testRouter.get('/user/activate/:token', activateUser);

testRouter.get('/passwords', authenticate, getAllPasswords);
testRouter.post('/password/create', authenticate, createPassword);
testRouter.get('/password/:id', authenticate, getPassword);
// testRouter.get('/password/:id/shared', (req, res) => {});

module.exports = testRouter;
