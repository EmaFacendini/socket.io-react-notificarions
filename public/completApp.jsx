
// models/Notification.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  recipientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
  },
});

module.exports = Notification;

//************************************************************************ */


// controllers/notificationController.js

const Notification = require('../models/Notification');

// Controlador para enviar una nueva notificación
const sendNotification = async (req, res) => {
  const { senderId, recipientId, message } = req.body;
  try {
    // Guardar la notificación en la base de datos
    const notification = await Notification.create({ senderId, recipientId, message });
    
    // Emitir la notificación al destinatario a través de Socket.IO
    req.app.get('io').to(recipientId).emit('notification', notification);
    
    // Respondemos con la notificación creada
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { sendNotification };

// Función para obtener el nombre del usuario por su ID
const getUserNameById = async (userId) => {
  try {
    // Buscar el usuario en la base de datos por su ID
    const user = await User.findByPk(userId);

    // Verificar si se encontró el usuario y devolver su nombre
    if (user) {
      return user.name;
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    throw new Error('Error fetching user name');
  }
};

module.exports = { sendNotification, getUserNameById };

//************************************************************************ */

// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const { sendNotification } = require('./controllers/notificationController');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuración de Sequelize
sequelize.authenticate()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de Socket.IO
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

// Rutas
app.post('/sendNotification', sendNotification);

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// client/src/components/SendNotification.js

//************************************************************************ */

import React, { useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const SendNotification = ({ senderId, recipientId }) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    socket.emit('sendNotification', { senderId, recipientId, message });
    setMessage('');
  };

  return (
    <div>
      <h2>Send Notification</h2>
      <input
        type="text"
        placeholder="Enter message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default SendNotification;


//************************************************************************ */

// client/src/components/NotificationList.js

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const NotificationList = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.on('notification', (notification) => {
      setNotifications([...notifications, notification]);
    });

    return () => {
      socket.off('notification');
    };
  }, [notifications]);

  const handleAccept = (notificationId) => {
    socket.emit('updateNotification', { id: notificationId, status: 'accepted' });
  };

  const handleReject = (notificationId) => {
    socket.emit('updateNotification', { id: notificationId, status: 'rejected' });
  };

  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifications.map((notification) => (
          <li key={notification.id}>
            <p>{notification.message}</p>
            {notification.recipientId === userId && (
              <div>
                <button onClick={() => handleAccept(notification.id)}>Accept</button>
                <button onClick={() => handleReject(notification.id)}>Reject</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationList;


