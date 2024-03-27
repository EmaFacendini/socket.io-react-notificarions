// notificationController.js

const { Notification } = require('./models');
const { io } = require('./server'); // Asegúrate de exportar el objeto 'io' desde el archivo server.js

// Controlador para enviar una nueva notificación
const sendNotification = async (senderId, recipientId, message) => {
  try {
    const notification = await Notification.create({
      senderId,
      recipientId,
      message,
    });
    io.emit('notification', notification); // Emitir la notificación a todos los clientes conectados
    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

module.exports = {
  sendNotification,
};
