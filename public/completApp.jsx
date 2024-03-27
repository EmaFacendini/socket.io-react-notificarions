
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

//1.4. Configuración de las rutas y controladores
//Crea una carpeta controllers y dentro de ella, crea un archivo //notificationController.js para definir los controladores relacionados con las //notificaciones.
//
//bash
//Copy code
//mkdir controllers
//touch controllers/notificationController.js
//javascript
//Copy code

// controllers/notificationController.js

const Notification = require('../models/Notification');

// Controlador para enviar una nueva notificación
const sendNotification = async (req, res) => {
  const { senderId, recipientId, message } = req.body;
  try {
    const notification = await Notification.create({ senderId, recipientId, message });
    req.app.get('io').to(senderId).emit('notification', notification);
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { sendNotification };

//************************************************************************ */

//1.5. Configuración de Express y Socket.IO
//Crea un archivo server.js para configurar Express y Socket.IO.

//bash
//Copy code
//touch server.js
//javascript
//Copy code


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

//************************************************************************ */
//1.6. Configuración de Sequelize y conexión a la base de datos
//Crea un archivo database.js en una carpeta config para configurar Sequelize y //establecer la conexión con la base de datos.

//bash
//Copy code
//mkdir config
//touch config/database.js
//javascript
//Copy code
// config/database.js

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
});

module.exports = sequelize;

Paso 2: Configuración del Frontend
2.1. Inicialización de la aplicación React
Dentro de la carpeta del proyecto, inicializa una aplicación React.

bash
Copy code
npx create-react-app client
cd client
2.2. Instalación de socket.io-client
Instala socket.io-client para la comunicación con el servidor Socket.IO.

bash
Copy code
npm install socket.io-client
2.3. Componente para enviar notificaciones
Crea un componente llamado SendNotification en src/components para enviar notificaciones.

Copy code

User
continua
ChatGPT
Claro, continuemos con la configuración del frontend.

Dentro de la carpeta client/src/components, crea un archivo llamado SendNotification.js para el componente que enviará notificaciones.

jsx
Copy code
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
2.4. Componente para mostrar notificaciones
Crea un componente llamado NotificationList en client/src/components para mostrar las notificaciones.

jsx
Copy code

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


//Paso 3: Integra el Frontend y el Backend
//Ahora que hemos configurado tanto el backend como el frontend, necesitamos //integrarlos. Para eso, necesitamos realizar los siguientes pasos:

//Iniciar el servidor Express en el backend.
//Iniciar la aplicación React en el frontend.
//Configurar la comunicación entre el frontend y el backend utilizando Socket.IO.
//Puedes integrar el frontend y el backend siguiendo estas instrucciones:

//En la carpeta raíz del proyecto, inicia el servidor Express ejecutando el comando //node server.js.
//En la carpeta client, inicia la aplicación React ejecutando el comando npm start.
//Con estos pasos, el frontend y el backend deberían estar integrados y funcionando //correctamente. Ahora puedes enviar notificaciones desde el frontend al backend y //recibir notificaciones actualizadas en tiempo real desde el backend al frontend. //Asegúrate de ajustar el código según tus necesidades específicas y la lógica de tu //aplicación.




