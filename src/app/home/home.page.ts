import { ApplicationRef, Component } from '@angular/core';
import { OSNotificationPayload } from '@ionic-native/onesignal/ngx';

import { PushService } from '../services/push.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  messages: OSNotificationPayload[] = [];

  constructor(
    private applicationRef: ApplicationRef,
    public pushService: PushService,
  ) {}

  ngOnInit() {
    this.pushService.pushListener.subscribe(notification => {
      this.messages.unshift(notification);
      this.applicationRef.tick();
    });
  }

  async ionViewWillEnter() {
    this.messages = await this.pushService.getMessages();
    console.log('this.messages: ', this.messages);
  }

  async clearMessages() {
    await this.pushService.clearMessages();
    this.messages = [];
  }

}
