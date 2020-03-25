import {Component} from '@angular/core';
import {Platform} from '@ionic/angular';
import {BluetoothleService} from '../service/bluetoothle.service';
import {DevicesService} from '../service/devices.service';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {
    private devices: any = [];
    private myDevice: any = null;


    constructor(
        private bluetoothleService: BluetoothleService,
        private devicesService: DevicesService,
        private platform: Platform) {

        this.devicesService.createDatabase();
    }

    ionViewWillEnter() {
        this.platform.ready().then((readySource) => {
            this.devicesService.getUUID().then((sqlResult: any) => {
                if (sqlResult.rows.length === 0) {
                    console.log('UUID not in place yet');
                    this.delay(2000).then((successTimeout) => {
                        this.ionViewWillEnter();
                    }, (errorTimeout) => {
                        this.ionViewWillEnter();
                    });
                } else {
                    for (let index = 0; index < sqlResult.rows.length; index++) {
                        const uuidObject = sqlResult.rows.item(index);
                        this.myDevice = uuidObject.value;
                    }
                    console.log('Getting UUID: ' + this.myDevice);
                    this.bluetoothleService.initializeCentral(this.myDevice);
                    this.getAllDevices();
                }

            }, (error) => {
                console.log('error getting UUID: ' + JSON.stringify(error));
                this.delay(2000).then((successTimeout) => {
                    this.ionViewWillEnter();
                }, (errorTimeout) => {
                    this.ionViewWillEnter();
                });
            });
        });
    }


    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getAllDevices() {


        setInterval(() => {
            this.devicesService.getAll().then(deviceList => {
                this.devices = deviceList;
            });
            console.log('device list updated');
        }, 5000);


    }

    cleanDevices() {
        this.devicesService.truncate();
    }

}
