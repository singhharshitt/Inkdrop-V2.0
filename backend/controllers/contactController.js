const Contact = require('../models/contactModel');

exports.handleContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();

    res.status(200).json({ message: 'Message stored successfully!' });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};
