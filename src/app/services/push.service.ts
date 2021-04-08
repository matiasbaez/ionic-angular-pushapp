import { Injectable, EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  messages: OSNotificationPayload[] = [];
  pushListener = new EventEmitter<OSNotificationPayload>();
  userId: string;

  constructor(
    private oneSignal: OneSignal,
    private storage: Storage
  ) {
    this.loadMessages();
  }

  async initConfig() {
    this.oneSignal.startInit('da75f998-b004-48a9-81af-5b42a352c94b', '399309875948');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationReceived().subscribe((notification) => {
      // do something when notification is received
      console.log('Notificacion recibida: ', notification);
      this.notificationReceived(notification);
    });

    this.oneSignal.handleNotificationOpened().subscribe(async (received) => {
      // do something when a notification is opened
      console.log('Notificacion abierta: ', received);
      await this.notificationReceived(received.notification);
    });

    this.oneSignal.getIds().then(info => {
      this.userId = info.userId;
    });

    this.oneSignal.endInit();
  }

  async notificationReceived(notification: OSNotification) {
    await this.loadMessages();

    const payload = notification.payload;

    const pushControl = this.messages.find(message => message.notificationID === payload.notificationID);
    if (pushControl) {
      return;
    }

    this.messages.unshift(payload);
    this.pushListener.emit(payload);
    await this.saveMessages();

  }

  saveMessages() {
    console.log('saveMessages');
    this.storage.set('messages', this.messages);
    this.loadMessages();
  }

  async loadMessages() {
    console.log('loadMessages');
    this.messages = await this.storage.get('messages') || [];
    return this.messages;
  }

  async getMessages() {
    console.log('getMessages');
    await this.loadMessages();
    return [...this.messages];
  }

  async clearMessages() {
    await this.storage.clear();
    this.messages = [];
    this.saveMessages();
  }
}
