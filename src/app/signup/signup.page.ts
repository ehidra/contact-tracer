import {Component, OnInit} from '@angular/core';
import {NavController} from '@ionic/angular';
import {cfaSignIn} from 'capacitor-firebase-auth';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

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
    ) {
        this.signupForm = formBuilder.group({
            phone: ['', Validators.compose([Validators.required])]
        });
    }

    ngOnInit() {
    }

    validatePhone(phone) {

        this.submitAttempt = true;
        if (this.signupForm.valid) {
            const newUser = {
                phone: this.signupForm.value.phone
            };
            cfaSignIn('phone', {phone}).subscribe(
                (user) => {
                    console.log(user.phoneNumber);
                }
            );
        }

    }
}
