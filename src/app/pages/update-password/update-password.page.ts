import { Component, OnInit } from '@angular/core';
import { AuthService } from './../../services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.page.html',
  styleUrls: ['./update-password.page.scss'],
})
export class UpdatePasswordPage implements OnInit {

  constructor(
        private newPassword:string,
        private fb: FormBuilder,
        private authService: AuthService,
        private loadingController: LoadingController,
        private alertController: AlertController,
        private router: Router
  ) {
    
   }

  ngOnInit() {
  }

   updatePassword() {
  this.authService.updatePassword( this.newPassword);
}

 
}
