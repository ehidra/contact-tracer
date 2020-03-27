import {Component, OnInit} from '@angular/core';
import {NavController} from '@ionic/angular';
import {cfaSignIn, cfaSignInPhoneOnCodeSent, cfaSignInPhoneOnCodeReceived} from 'capacitor-firebase-auth';
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
            cfaSignIn('phone', {phone: newUser.phone}).subscribe(
                (caSignIn) => {
                    console.log(caSignIn.phoneNumber);
                }, (errorCfaSignIn) => {
                    console.log('Error Signing in phone UUID: ' + JSON.stringify(errorCfaSignIn));
                }
            );

            // Android and iOS
            cfaSignInPhoneOnCodeSent().subscribe(
                (verificationId) => {
                    console.log(JSON.stringify(verificationId));
                },
                (error) => {
                    console.log(JSON.stringify(error));
                }
            );

            // Android Only
            cfaSignInPhoneOnCodeReceived().subscribe(
                (event: { verificationId: string, verificationCode: string }) => {
                    console.log(`${event.verificationId}:${event.verificationCode}`);
                },
                (error) => {
                    console.log(JSON.stringify(error));
                }
            );
        }
    }
}
