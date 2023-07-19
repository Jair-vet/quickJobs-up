const { Schema, model } = require('mongoose');

const logoSchema = new Schema({
    img: {
        type: String
    },
    created_at: {
        type: Date, default: Date.now()
    }
});

module.exports = model('Logo', logoSchema);