require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./modèle/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connecté à la BDD');
    const user = new User({ email: 'test' + Date.now() + '@test.com', password: 'password123' });
    user.save()
      .then(() => {
        console.log('Succès !');
        process.exit(0);
      })
      .catch(err => {
        console.error('Erreur Mongoose save:', err);
        process.exit(1);
      });
  })
  .catch(err => {
    console.error('Erreur connexion', err);
    process.exit(1);
  });
