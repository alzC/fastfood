const OrderSchema = new mongoose.Schema({
    customerId: mongoose.Schema.Types.ObjectId,
    products: [{ productId: mongoose.Schema.Types.ObjectId, quantity: Number }],
    deliveryInfo: {
        name: String,
        address: String,
        phone: String,
    },
    status: { type: String, enum: ['pending', 'delivered'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
