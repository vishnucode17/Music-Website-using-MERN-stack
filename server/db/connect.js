const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://new_user:123@cluster0.cr02s.mongodb.net/JustAudio?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to database');
    });