const Book = require('../modèle/Book');
const fs = require('fs');

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
}

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
}

exports.getBestRating = (req, res, next) => {
  Book.find().sort({ averageRating: -1 }).limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(404).json({ error }));
}

exports.ratingBook = (req, res, next) => {
  if (req.body.rating < 0 || req.body.rating > 5) {
    return res.status(400).json({ error: 'Note invalide' });
  }
}

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    ratings: [],
    averageRating: 0,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  });
  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré' }))
    .catch(error => res.status(400).json({ error }));
}

exports.findOne = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        return res.status(401).json({ error: 'Non autorisé' });
      }
      Book.updateOne({ _id: req.params.id }, { ...book, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre modifié' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(404).json({ error }));
}

exports.modifyBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        return res.status(401).json({ error: 'Non autorisé' });
      }
      const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : { ...req.body };
      delete bookObject._userId;
      Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
        .then(() => {
          if (req.file) {
            fs.unlinkSync(`images/${book.imageUrl.split('/images/')[1]}`);
          }
          res.status(200).json({ message: 'Livre modifié' })
        })
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(404).json({ error }));
}

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        return res.status(401).json({ error: 'Non autorisé' });
      }
      const filename = book.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre supprimé' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(404).json({ error }));
}


