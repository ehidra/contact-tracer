import { Injectable } from '@angular/core';
import {LoadingController} from '@ionic/angular';
@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  currentLoading: any;

  constructor(private loadingController: LoadingController) { }


  async presentLoading(content: string) {
    this.currentLoading = await this.loadingController.create({
      message: content
    });
    await this.currentLoading.present();
  }

  async dismiss() {
    if (this.currentLoading != null) {

      this.loadingController.dismiss();
      this.currentLoading = null;
    }
    return;
  }
}
