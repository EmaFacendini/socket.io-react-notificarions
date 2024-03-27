// notificationController.js

const { Notification } = require('./models');

// Controlador para actualizar el estado de una notificación
const updateNotificationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validar que el estado enviado sea válido
  if (status !== 'accepted' && status !== 'rejected') {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Verificar que el receptor sea el destinatario de la notificación
    if (notification.recipientId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Actualizar el estado de la notificación
    notification.status = status;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateNotificationStatus,
};
