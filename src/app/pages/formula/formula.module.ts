import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormulaPageRoutingModule } from './formula-routing.module';

import { FormulaPage } from './formula.page';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormulaPageRoutingModule,
    TranslateModule   // 👈 Importar aquí
  ],
  declarations: [FormulaPage]
})
export class FormulaPageModule {}
