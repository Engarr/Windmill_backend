import jwt from 'jsonwebtoken';

const getUserId = (req, res, next) => {
  const authHeader = req.get('Authorization');
  const token = authHeader.split(' ')[1];

  if (token === 'null') {
    req.userId = 'notregistered';
    next();
  } else {
    let decodedToken;

    try {
      decodedToken = jwt.decode(token, process.env.VITE_SECRET_TOKEN);
    } catch (err) {
      err.statusCode = 500;
      throw err;
    }
    if (!decodedToken) {
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      throw error;
    }
    req.userId = decodedToken.userId;
    next();
  }
};
export default getUserId;
