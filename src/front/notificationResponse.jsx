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

    // Emitir una actualización al remitente si es necesario
    const notificationToUpdate = notifications.find(notification => notification.id === notificationId);
    if (notificationToUpdate && notificationToUpdate.senderId !== userId) {
      socket.emit('notificationUpdate', { notificationId, status: 'accepted' });
    }
  };

  const handleReject = (notificationId) => {
    socket.emit('updateNotification', { id: notificationId, status: 'rejected' });

    // Emitir una actualización al remitente si es necesario
    const notificationToUpdate = notifications.find(notification => notification.id === notificationId);
    if (notificationToUpdate && notificationToUpdate.senderId !== userId) {
      socket.emit('notificationUpdate', { notificationId, status: 'rejected' });
    }
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
