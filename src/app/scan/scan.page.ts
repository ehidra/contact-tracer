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
    private isScanning = false;
    private isAdvertising = false;

    constructor(
        private bluetoothleService: BluetoothleService,
        private authService: AuthService,
        private databaseService: DatabaseService) {

    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        this.myDevice = this.authService.uuid;
        this.bluetoothleService.initializeCentral();
        this.refreshView();
    }

    refreshView() {

        setInterval(() => {
            this.isScanning = this.bluetoothleService.isScanning;
            this.isAdvertising = this.bluetoothleService.isAdvertising;
            this.databaseService.getLast20().then(deviceList => {
                this.devices = deviceList;
            });
            console.log('device list updated');
        }, 2000);

    }

    cleanDevices() {
        this.databaseService.truncate();
    }

}
