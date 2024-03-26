const express = require('express');
const moment = require('moment');
const config = require('config');
const {AmoApiClient} = require('@mobilon-dev/amotop');
const {AmoAppsCentralClient} = require('@mobilon/amo_apps_central_client');

const {AmoConversation} = require('../../models');

const amoAppsCentralClient = new AmoAppsCentralClient(config.amoAppsCentral);


const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({extended: true}));

  app.get('/', async (req, res) => {
    console.log('GET /');
    res.send('OK');
  })

  app.post('/:appId/messages/:integrationId/:channelCode', async (req, res) => {
    const {appId, integrationId, channelCode} = req.params;
    console.log('>>> start');
    console.log(`POST /:appId/messages/:integrationId/:channelCode`);
    console.log(`appId: ${appId}, integrationId: ${integrationId}, channel code: ${channelCode}`);
    console.log('data:', req.body);

    res.json({status: 'OK'});

    try {
      const data = req.body;

      const conversationId = data.message?.conversation?.id;
      const receiverId = data.message?.receiver?.id;
      const receiverPhone = data.message?.receiver?.phone;
      const sourceExternalId = data.message?.source?.external_id;

      // найти или создать amoConversation
      let amoConversation = await AmoConversation.findOne({integrationId, conversationId});

      if (amoConversation) {
        console.log('amo conversation exist', amoConversation.toObject());
      }

      if (!amoConversation) {
        console.log('not found conversation');
        const amoConversationData = {integrationId, conversationId, channelCode, receiverId, receiverPhone, sourceExternalId};
        console.log('amo conversation data', amoConversationData);
        amoConversation = await AmoConversation.create(amoConversationData);
        console.log('new amo conversation added');
      }

      if (!amoConversation.contactId) {
        const creds = await amoAppsCentralClient.getCreds('app07', integrationId);
        console.log('creds', creds);
        const amoApiClient = new AmoApiClient(creds.domain, creds.accessToken, {debug: true});
        // найти по номеру связанный контакт
        const response = await amoApiClient.getContacts({query: receiverPhone.substring(1)});
        console.log('contacts', response._embedded.contacts.length);

        if (response._embedded.contacts.length > 0) {
          const contactId = response._embedded.contacts[0]?.id;
          amoConversation.contactId = contactId;
          await amoConversation.save();
        }
      }
      
    } catch (err) {
      console.log('err', err)
    } finally {
      console.log('>>> end');
    }
  });

  return app;
};

module.exports = {
  createApp,
};
