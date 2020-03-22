import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {BluetoothLE} from '@ionic-native/bluetooth-le/ngx';
import {HomePage} from './home.page';
import {DatePipe} from '@angular/common';
import {BluetoothSerial} from '@ionic-native/bluetooth-serial/ngx';
import {UniqueDeviceID} from '@ionic-native/unique-device-id/ngx';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild([
            {
                path: '',
                component: HomePage
            }
        ])
    ],
    providers: [BluetoothLE, DatePipe, BluetoothSerial, UniqueDeviceID ],
    declarations: [HomePage]
})
export class HomePageModule {
}
