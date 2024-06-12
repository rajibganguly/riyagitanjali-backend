const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentsSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    userPaymentId: {
        type: String,
        required: true
    },
    payFor: {
        type: String
    },
    timestamp: { type: String, default: () => new Date().toISOString() }
});

const Payments = mongoose.model('Payments', PaymentsSchema);

module.exports = Payments;
