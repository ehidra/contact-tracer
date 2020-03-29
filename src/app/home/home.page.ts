import {Component, OnInit} from '@angular/core';
import {Platform} from '@ionic/angular';
import {DatabaseService} from '../service/database.service';
import {NavController} from '@ionic/angular';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

    constructor(
        private databaseService: DatabaseService,
        private platform: Platform,
        private navController: NavController) {

    }

    ngOnInit() {

    }

}
