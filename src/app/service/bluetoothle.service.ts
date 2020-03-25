import {Injectable} from '@angular/core';
import {DatePipe} from '@angular/common';
import {DevicesService} from '../service/devices.service';
import {BluetoothLE} from '@ionic-native/bluetooth-le/ngx';
import {Platform} from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class BluetoothleService {

    private connectedTries = [];
    private myDevice = null;

    constructor(private bluetoothLE: BluetoothLE,
                private devicesService: DevicesService,
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
        this.bluetoothLE.initializePeripheral(configPeripheral).subscribe((successInitializePeripheralResult) => {
            if (successInitializePeripheralResult.status === 'enabled') {

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
                this.bluetoothLE.addService(characteristics).then((successAddService) => {
                    console.log('Peripheral addService: ' + JSON.stringify(successAddService));
                    this.manageAdvertisingCycle();
                }, (errorAddService) => {
                    console.log('Peripheral addService Error: ' + JSON.stringify(errorAddService));
                });
            }

            // If read request received just send the phone UUID so we now who is in the other end
            if (successInitializePeripheralResult.status === 'readRequested') {

            }

        }, (errorInitializePeripheralResult) => {
            console.log('initializePeripheralError: ' + JSON.stringify(errorInitializePeripheralResult));
        });
    }

    manageAdvertisingCycle() {

        this.startAdvertising();
        if (this.platform.is('android')) {
            this.delay(4000).then((successTimeoutAdvertising) => {
                this.stopAdvertising();
            }, (errorTimeoutAdvertising) => {
                console.log('Scan Timeout Advertising: ' + JSON.stringify(errorTimeoutAdvertising));
            });
        }

    }

    startAdvertising() {

        const uuid = this.myDevice.slice(0, 10);
        const encodedBytes = this.bluetoothLE.stringToBytes(uuid);
        const encodedString = this.bluetoothLE.bytesToEncodedString(encodedBytes);

        const params = {
            services: ['1234'], // iOS
            service: '1234', // Android
            name: 'Contact Tracer',
            mode: 'balanced',
            // timeout: 2000,
            txPowerLevel: 'medium',
            connectable: false,
            manufacturerId: 1,
            includeDeviceName: false,
            manufacturerSpecificData: encodedString
        };
        this.bluetoothLE.startAdvertising(params).then((successStartAdvertising) => {
            console.log('Peripheral startAdvertising: ' + JSON.stringify(successStartAdvertising));
        }, (errorStartAdvertising) => {
            console.log('Peripheral startAdvertising Error: ' + JSON.stringify(errorStartAdvertising));
        });
    }

    stopAdvertising() {
        this.bluetoothLE.stopAdvertising().then((successstopAdvertising) => {
            console.log('Peripheral stopAdvertising: ' + JSON.stringify(successstopAdvertising));
            this.manageAdvertisingCycle();
        }, (errorStopAdvertising) => {
            console.log('Peripheral stopAdvertising Error: ' + JSON.stringify(errorStopAdvertising));
        });
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
                let deviceUUid = '';
                deviceUUid = successStartScan.name;
                // if (this.platform.is('ios')) {
                // } else if (this.platform.is('android')) {
                //    const advertisement = successStartScan.advertisement as string;
                // console.log('scanResult2: ' + advertisement);
                //   const byteString = this.bluetoothLE.encodedStringToBytes(advertisement);
                // console.log('scanResult3: ' + byteString);
                //   deviceUUid = this.bluetoothLE.bytesToString(byteString).slice(4, 24);
                // }
                if (!this.connectedTries.includes(deviceUUid)) {
                    this.connectedTries.push(deviceUUid);
                    const device = {uuid: deviceUUid, rssi: successStartScan.rssi};
                    this.addDevice(device);
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
        const timeString = this.datePipe.transform(dateNow, 'hh:mm:ss');
        this.devicesService.create({
            uuid: device.uuid,
            rssi: device.rssi,
            date_found: dateString,
            time_found: timeString
        });
    }

}
