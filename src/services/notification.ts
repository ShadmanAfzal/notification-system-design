import {Kafka, logLevel} from 'kafkajs';
import UserService from './user';

type NotificationMessage = {
  senderId: string;
  receiverId: string;
  type: 'LIKE' | 'UNLIKE' | 'COMMENT';
};

class NotificationService {
  client;
  userService;
  constructor() {
    this.client = new Kafka({
      clientId: 'notification',
      brokers: ['localhost:29092'],
      logLevel: logLevel.ERROR,
    });

    this.userService = new UserService();
  }

  async sendNotification(message: NotificationMessage) {
    const producer = this.client.producer();
    await producer.connect();
    await producer.send({
      topic: 'notifcation-topic',
      messages: [
        {
          value: JSON.stringify(message),
        },
      ],
    });
  }

  async consumeLikesNotification() {
    const consumer = this.client.consumer({groupId: 'notification-group'});
    await consumer.subscribe({
      topic: 'notifcation-topic',
      fromBeginning: true,
    });

    await consumer.run({
      eachMessage: async ({message}) => {
        if (message.value) {
          const parsedMessage = message.value.toString();
          const notification = JSON.parse(parsedMessage) as NotificationMessage;

          const sender = await this.userService.getUser(notification.senderId);
          const receiver = await this.userService.getUser(
            notification.receiverId
          );

          console.log({
            sender: sender?.email,
            receiver: receiver?.email,
            type: notification.type,
          });
        }
      },
    });
  }
}

export default NotificationService;
