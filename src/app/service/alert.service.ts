import {Injectable} from '@angular/core';
import {AlertController} from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class AlertService {

    currentAlert: any;

    constructor(private alertController: AlertController) {
    }

    async presentAlert(headerMessage: string, subHeaderMessage: string) {

        this.currentAlert = await this.alertController.create({
            header: headerMessage,
            subHeader: subHeaderMessage,
            buttons: ['OK']
        });

        await this.currentAlert.present();
    }

    async presentAlertChoice(headerMessage: string, subHeaderMessage: string, buttons: any) {
        const alert = await this.alertController.create({
            header: headerMessage,
            subHeader: subHeaderMessage,
            buttons
        });

        await alert.present();
    }
}
