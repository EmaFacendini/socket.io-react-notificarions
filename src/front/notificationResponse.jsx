import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const NotificationListComponent = () => {
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
    socket.emit('updateNotification', {
      id: notificationId,
      status: 'accepted',
    });
  };

  const handleReject = (notificationId) => {
    socket.emit('updateNotification', {
      id: notificationId,
      status: 'rejected',
    });
  };

  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index}>
            {notification.message}
            <button onClick={() => handleAccept(notification.id)}>
              Accept
            </button>
            <button onClick={() => handleReject(notification.id)}>
              Reject
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationListComponent;
