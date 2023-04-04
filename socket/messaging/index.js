// const formidable = require("formidable");
const { v4: uuidv4 } = require("uuid");

const markNotificationReadService = require("../../services/notifications/markNotificationRead");
const addNotification = require("../../services/notifications/addNotification");
const saveMessage = require("../../services/messages/saveMessage");
const unsendMessage = require("../../services/messages/unsendMessage");
const markMessageReadService = require("../../services/messages/markMessageRead");
const markConversationReadService = require("../../services/messages/markConversationRead");

module.exports = (io) => {
  io.on("connect", (socket) => {
    console.log("socket is connected");
    socket.on("join-conversation", async (data, callback) => {
      const { userId, conversationId } = data;
      socket.join(conversationId);

      // Also mark the conversation read by this user
      const { messages, conversation } = await markConversationReadService({
        userId,
        conversationId,
      });

      if (conversation?._id && messages?.length > 0) {
        io.to(conversationId.toString()).emit("mark-conversation-read", {
          userId,
          messages,
          conversationId,
        });
      }
      if (callback) callback();
    });

    socket.on("leave-conversation", (data, callback) => {
      const { userId, conversationId } = data;
      console.log(userId, "left the conversation");
      socket.leave(conversationId);

      if (callback) callback();
    });

    socket.on("join", (userId, callback) => {
      socket.join(userId);

      if (callback) callback();
    });

    socket.on("start-type", (message, callback) => {
      socket
        .to(message.conversationId.toString())
        .emit("start-type", message.name);
      if (callback) callback();
    });

    socket.on("send-message", async (messageData, callback) => {
      const {
        conversationId,
        message,
        type,
        sender,
        reference_id,
        postMessage,
      } = messageData;
      let referenceId = uuidv4();
      if (reference_id) referenceId = reference_id;

      const { message: savedMessage, conversation } = await saveMessage({
        conversationId,
        type,
        message,
        sender,
        referenceId: referenceId,
        read_by: [
          {
            user: sender,
          },
        ],
        postMessage,
      });

      io.to(conversationId.toString()).emit("message", {
        type,
        message,
        sender: {
          _id: sender,
        },
        reference_id: referenceId,
      });
      conversation?.members?.forEach((id) => {
        io.to(id.toString()).emit("new-conversation-message", {
          conversation: {
            type: conversation.type,
            id: conversationId,
            group_name: conversation.group_name,
            group_description: conversation.group_description,
          },
          message: {
            type: savedMessage.type,
            message: savedMessage.message,
          },
        });
      });
      if (callback) callback(savedMessage);
    });

    socket.on("unsend-message", async (data, callback) => {
      const { userId, messageId, conversationId, referenceId } = data || {};
      if ((userId, messageId, conversationId)) {
        // TODO: handle edge cases
        await unsendMessage({
          userId,
          messageId,
          conversationId,
        });

        io.to(conversationId.toString()).emit("unsend-message", {
          messageId,
          conversationId,
          messageUnSendingUser: userId,
          referenceId,
        });
        if (callback) callback();
      }
    });

    socket.on("read-message", async (data) => {
      const { userId, conversationId, messageId, referenceId } = data;
      try {
        const res = await markMessageReadService(
          userId,
          messageId,
          conversationId,
          referenceId
        );
        const { message } = res || {};

        if (message) {
          console.log("mark message read");
          socket.to(conversationId.toString()).emit("mark-message-read", {
            message,
            conversationId,
          });
        }
      } catch (error) {
        console.log("inside error catch block!, ", error);
      }
    });

    socket.on("read-conversation", async (userId, conversationId) => {
      // TODO: handle edge cases
      const { messages, conversation } = await markConversationReadService({
        userId,
        conversationId,
      });

      if (conversation._id) {
        io.to(conversationId.toString()).emit("mark-conversation-read", {
          userId,
          messages,
          conversationId,
        });
      }
    });

    socket.on("add-post-notification", async (data, callback) => {
      // TODO: handle edge cases
      const notification = await addNotification(data);

      if (notification) {
        socket.to(notification.receiver.toString());
      }

      if (callback) callback();
    });

    socket.on("read-notification", async (data) => {
      const { notificationId, userId } = data;
      markNotificationReadService(userId, notificationId);
    });

    socket.on("disconnect", () => {
      console.log("socket is disconnected");
    });
  });
};
