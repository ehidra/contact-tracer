import {Component, OnInit} from '@angular/core';
import {NavController} from '@ionic/angular';
import {FirebaseAuthentication} from '@ionic-native/firebase-authentication/ngx';
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
        private firebaseAuthentication: FirebaseAuthentication
    ) {
        this.signupForm = formBuilder.group({
            phone: ['+34647173288', Validators.compose([Validators.required])]
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
            this.firebaseAuthentication.verifyPhoneNumber(newUser.phone, 3000).then((res: any) => {
                console.log(res);
            }).catch((error: any) => console.error(error));

        }
    }
}
