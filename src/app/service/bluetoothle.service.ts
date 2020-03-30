import {Injectable} from '@angular/core';
import {DatePipe} from '@angular/common';
import {DatabaseService} from '../service/database.service';
import {AuthService} from '../service/auth.service';
import {BluetoothLE} from '@ionic-native/bluetooth-le/ngx';
import {Platform} from '@ionic/angular';
import * as forge from 'node-forge';

@Injectable({
    providedIn: 'root'
})
export class BluetoothleService {

    private connectedTries = [];
    private myDevice = null;

    constructor(private bluetoothLE: BluetoothLE,
                private databaseService: DatabaseService,
                private authService: AuthService,
                private datePipe: DatePipe,
                private platform: Platform) {

    }

    // START PERIPHERAL CODE
    initializePeripheral() {
        // Initialise the peripheral service for the bluetoothle
        const configPeripheral = {
            request: true,
            restoreKey: 'bluetoothlecontacttracerperipheral'
        };

        // everytime the peripheral is interacted with , it will call this function
        this.bluetoothLE.initializePeripheral(configPeripheral).subscribe(async (successInitializePeripheralResult) => {
            if (successInitializePeripheralResult.status === 'enabled') {
                try {
                    console.log('initializePeripheral: ' + JSON.stringify(successInitializePeripheralResult));
                    // We create the Blueetoothle service
                    const characteristics = {
                        service: '1234',
                        characteristics: [
                            {
                                uuid: '2ab4aacd-ccea-4cf8-9f27-a25fe60ac5f0',
                                permissions: {
                                    read: true,
                                    write: true,
                                    // readEncryptionRequired: true,
                                    // writeEncryptionRequired: true,
                                },
                                properties: {
                                    read: true,
                                    writeWithoutResponse: true,
                                    write: true,
                                    notify: true,
                                    indicate: true,
                                    // authenticatedSignedWrites: true,
                                    // notifyEncryptionRequired: true,
                                    // indicateEncryptionRequired: true,
                                }
                            }
                        ]
                    };
                    const addServiceResult = await this.bluetoothLE.addService(characteristics);
                    const manageAdvertisingCycleResult = await this.manageAdvertisingCycle();
                } catch (e) {
                    console.log('Error Adding Service and Advertising' + e);
                }
            }

            // If read request received just send the phone UUID so we now who is in the other end
            if (successInitializePeripheralResult.status === 'readRequested') {

            }

        }, (errorInitializePeripheralResult) => {
            console.log('initializePeripheralError: ' + JSON.stringify(errorInitializePeripheralResult));
        });
    }

    async manageAdvertisingCycle() {

        try {
            const startAdvertisingResult = await this.startAdvertising();
            if (startAdvertisingResult.status === 'advertisingStarted') {
                await this.delay(4000);
                // const stopAdvertisingResult = await this.stopAdvertising();
                // if (stopAdvertisingResult.status === 'advertisingStopped') {
                //    if (this.platform.is('ios')) {
                //        await this.delay(4000);
                //    }
                // }
            }
            await this.manageAdvertisingCycle();
        } catch (e) {
            console.log('manageAdvertisingCycleError: ' + e);
        }
    }

    startAdvertising() {

        const uuid = this.myDevice.slice(0, 20);
        const encodedBytes = this.bluetoothLE.stringToBytes(uuid);
        const encodedString = this.bluetoothLE.bytesToEncodedString(encodedBytes);

        const params = {
            services: ['1234'], // iOS
            service: '1234', // Android
            name: uuid,
            mode: 'balanced',
            // timeout: 2000,
            txPowerLevel: 'medium',
            connectable: false,
            manufacturerId: 1,
            includeDeviceName: false,
            manufacturerSpecificData: encodedString
        };
        return this.bluetoothLE.startAdvertising(params);
    }

    stopAdvertising() {
        return this.bluetoothLE.stopAdvertising();
    }

    // END PERIPHERAL CODE
    // START CENTRAL CODE

    initializeCentral(myDevice) {

        this.myDevice = myDevice;
        // Initialise the central service for the bluetoothle
        const config = {
            request: true,
            statusReceiver: true,
            restoreKey: 'bluetoothlecontacttracercentral'
        };
        console.log(' Initialize params ' + JSON.stringify(config));
        this.bluetoothLE.initialize(config).subscribe(successInitialize => {
            console.log('Initialize: ' + JSON.stringify(successInitialize));
            // start the scan of devices BLE
            if (successInitialize.status === 'enabled') {
                this.initializePeripheral();
                this.manageScanCycle();
            } else if (successInitialize.status === 'disabled') {

                if (this.platform.is('android')) {
                    this.bluetoothLE.enable();
                }
                this.initializeCentral(this.myDevice);
            }
        }, (errorInitialize) => {
            console.log('Error Initialize: ' + JSON.stringify(errorInitialize));
        });
    }

    manageScanCycle() {

        this.startScan();
        this.delay(10000).then((successTimeoutScan) => {
            this.stopScan().then((successStopScan) => {
                console.log('StopScan Success: ' + JSON.stringify(successStopScan));
                this.delay(10000).then((successSecondTimeoutScan) => {
                    this.manageScanCycle();
                }, (errorSecondTimeoutScan) => {
                    console.log('Scan Second Timeout Error: ' + JSON.stringify(errorSecondTimeoutScan));
                });
            }, (errorStopScan) => {
                console.log('StopScan Error: ' + JSON.stringify(errorStopScan));
            });
        }, (errorTimeoutScan) => {
            console.log('Scan Timeout Error: ' + JSON.stringify(errorTimeoutScan));
        });
    }

    startScan() {
        this.connectedTries = [];
        const params = {
            services: ['1234'],
            allowDuplicates: false,
            scanMode: this.bluetoothLE.SCAN_MODE_LOW_POWER,
            matchMode: this.bluetoothLE.MATCH_MODE_STICKY,
            matchNum: this.bluetoothLE.MATCH_NUM_MAX_ADVERTISEMENT,
            callbackType: this.bluetoothLE.CALLBACK_TYPE_ALL_MATCHES
        };
        this.bluetoothLE.startScan(params).subscribe((successStartScan) => {

            if (successStartScan.status === 'scanResult') {
                console.log('scanResult: ' + JSON.stringify(successStartScan));
                let advertisementDecoded = '';
                const advertisementResult = successStartScan.advertisement;
                if (typeof advertisementResult !== 'string') {
                    // IOS
                    const advertisement = advertisementResult.manufacturerData;
                    advertisementDecoded = atob(advertisement);
                } else {
                    // Android
                    const byteString = this.bluetoothLE.encodedStringToBytes(advertisementResult);
                    advertisementDecoded = this.bluetoothLE.bytesToString(byteString);
                }
                const regex = /[0-9a-zA-Z\-]{20}/;
                const deviceUUidArray = regex.exec(advertisementDecoded);
                if (deviceUUidArray.length) {
                    const deviceUUid = deviceUUidArray[0];
                    if (!this.connectedTries.includes(deviceUUid)) {
                        console.log('connectedTries: ' + JSON.stringify(this.connectedTries));
                        this.connectedTries.push(deviceUUid);
                        const device = {uuid: deviceUUid, rssi: successStartScan.rssi};
                        this.addDevice(device);
                    }

                }
            }
        }, (errorStartScan) => {
            console.log('error Start Scan: ' + JSON.stringify(errorStartScan));
        });
    }

    stopScan() {
        return this.bluetoothLE.stopScan();
    }

    // END CENTRAL CODE
    // PRIVATE FUNCTIONS

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    private addDevice(device) {

        const dateNow = Date.now();
        const dateString = this.datePipe.transform(dateNow, 'yyyy-MM-dd');
        const timeString = this.datePipe.transform(dateNow, 'HH:mm:ss');

        const publicKey = forge.pki.publicKeyFromPem(this.authService.publicKey) as forge.pki.rsa.PublicKey;
        const encryptText = publicKey.encrypt(forge.util.encodeUtf8(device.uuid));
        this.databaseService.create({
            uuid: device.uuid,
            rssi: device.rssi,
            date_found: dateString,
            time_found: timeString
        });
    }

}
