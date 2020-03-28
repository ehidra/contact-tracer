import {Component, OnInit} from '@angular/core';
import {NavController} from '@ionic/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../service/auth.service';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.page.html',
    styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

    public signupForm: FormGroup;
    public submitAttempt = false;

    constructor(
        public formBuilder: FormBuilder,
        private navController: NavController,
        private authService: AuthService
    ) {
        this.signupForm = formBuilder.group({
            phone: ['+', Validators.compose([Validators.required])]
        });
    }

    ngOnInit() {
    }

    validatePhone() {
        this.submitAttempt = true;
        if (this.signupForm.valid) {
            const newUser = {
                phone: this.signupForm.value.phone
            };
            console.log('Sending Phone Number' + newUser.phone);
            this.authService.signUp(newUser.phone);
        }
    }

    logout() {
        this.authService.logOut();
    }
}
