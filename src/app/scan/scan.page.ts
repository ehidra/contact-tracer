import {Component, OnInit} from '@angular/core';
import {Platform} from '@ionic/angular';
import {BluetoothleService} from '../service/bluetoothle.service';
import {DatabaseService} from '../service/database.service';
import {AuthService} from '../service/auth.service';

@Component({
    selector: 'app-scan',
    templateUrl: './scan.page.html',
    styleUrls: ['./scan.page.scss'],
})
export class ScanPage implements OnInit {

    private devices: any = [];
    private myDevice: any = null;

    constructor(
        private bluetoothleService: BluetoothleService,
        private authService: AuthService,
        private databaseService: DatabaseService) {

    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        this.myDevice = this.authService.uuid;
        this.bluetoothleService.initializeCentral(this.myDevice);
        this.getAllDevices();
    }

    getAllDevices() {

        setInterval(() => {
            this.databaseService.getAll().then(deviceList => {
                this.devices = deviceList;
            });
            console.log('device list updated');
        }, 5000);

    }

    cleanDevices() {
        this.databaseService.truncate();
    }

}
