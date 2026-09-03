const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => {
          console.error('Signup save error:', error);
          res.status(400).json({ error: error.message || error });
        });
    })
    .catch(error => {
      console.error('Signup hash error:', error);
      res.status(500).json({ error: error.message || error });
    });
};

exports.login = (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              process.env.JWT_SECRET || 'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => {
          console.error('Login compare error:', error);
          res.status(500).json({ error: error.message || error });
        });
    })
    .catch(error => {
      console.error('Login find error:', error);
      res.status(500).json({ error: error.message || error });
    });
};
