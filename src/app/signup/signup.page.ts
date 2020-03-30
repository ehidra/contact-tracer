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

    public step1 = false;
    public step2 = false;
    public signupForm: FormGroup;
    public verifyForm: FormGroup;
    public submitAttempt = false;
    public verifyAttempt = false;

    constructor(
        public formBuilder: FormBuilder,
        private navController: NavController,
        private authService: AuthService
    ) {
        this.signupForm = formBuilder.group({
            phone: ['+', Validators.compose([Validators.required])]
        });

        this.verifyForm = formBuilder.group({
            code: ['', Validators.compose([Validators.required])]
        });
    }

    ngOnInit() {

        this.step1 = true;
    }

    async validatePhone() {
        this.submitAttempt = true;
        if (this.signupForm.valid) {
            const newUser = {
                phone: this.signupForm.value.phone
            };
            console.log('Sending Phone Number' + newUser.phone);

            try {
                const signUpResult = await this.authService.signUp(newUser.phone);
                this.step1 = false;
                this.step2 = true;
            } catch (e) {
                console.log('Signup error happened');
            }
        }
    }

    async verifyPhone() {
        this.verifyAttempt = true;
        if (this.verifyForm.valid) {
            const newPhone = {
                code: this.verifyForm.value.code
            };
            console.log('Verifying Phone Number' + newPhone.code);

            try {
                const signVerify = await this.authService.verify(newPhone.code);
                this.step1 = false;
                this.step2 = true;
            } catch (e) {
                console.log('Verify error happened');
            }
        }
    }

    logout() {
        this.authService.logOut();
    }
}
