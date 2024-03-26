const mongoose = require('mongoose');

const AmoConversationSchema = new mongoose.Schema({
  integrationId: String,
  contactId: String,
  contactPhone: String,
  conversationId: String,
  sourceExternalId: String,
  channelCode: String,
});

module.exports = {
  AmoConversationSchema,
};
