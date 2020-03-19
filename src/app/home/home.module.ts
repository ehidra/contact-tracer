import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {BluetoothLE} from '@ionic-native/bluetooth-le/ngx';
import {HomePage} from './home.page';
import {DatePipe} from '@angular/common';
import {Device} from '@ionic-native/device/ngx';
import {BluetoothSerial} from '@ionic-native/bluetooth-serial/ngx';

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
    providers: [BluetoothLE, DatePipe, Device, BluetoothSerial],
    declarations: [HomePage]
})
export class HomePageModule {
}
