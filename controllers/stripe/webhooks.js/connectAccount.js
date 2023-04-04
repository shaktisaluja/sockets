const accountWebhookHandler = async (req, res, next) => {
  const event = req.body;
  // console.log({event});
  let eventDetails;
  switch (event.type) {
    case 'account.updated':
      eventDetails = event.data.object;
      // Then define and call a function to handle the event account.updated
      console.log("account updated event details: ", eventDetails)
      break;
    case 'account.application.authorized':
      eventDetails = event.data.object;
      // Then define and call a function to handle the event account.application.authorized
      break;
    case 'account.application.deauthorized':
      eventDetails = event.data.object;
      // Then define and call a function to handle the event account.application.deauthorized
      break;
    case 'account.external_account.created':
      eventDetails = event.data.object;
      // Then define and call a function to handle the event account.external_account.created
      break;
    case 'account.external_account.deleted':
      eventDetails = event.data.object;
      // Then define and call a function to handle the event account.external_account.deleted
      break;
    case 'account.external_account.updated':
      eventDetails = event.data.object;
      // Then define and call a function to handle the event account.external_account.updated
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  next();
};

module.exports = accountWebhookHandler;
