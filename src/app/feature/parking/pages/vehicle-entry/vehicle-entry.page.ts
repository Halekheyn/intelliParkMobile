import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';

import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { finalize } from 'rxjs';

import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';

import {
  ApiErrorResponse,
  CheckInRequest,
  ParkingRecord,
  VehicleType
} from '../../interfaces/parking.interface';

import { ParkingService } from '../../services/parking.service';

@Component({
  selector: 'app-vehicle-entry',
  templateUrl: './vehicle-entry.page.html',
  styleUrls: ['./vehicle-entry.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonList,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToolbar
  ]
})
export class VehicleEntryPage {

  private readonly formBuilder = inject(FormBuilder);
  private readonly parkingService = inject(ParkingService);

  readonly isSubmitting = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');
  readonly registeredEntry = signal<ParkingRecord | null>(null);

  /**
   * Formulario para registrar el ingreso.
   */
  readonly checkInForm = this.formBuilder.nonNullable.group({
    vehicle_plate: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(15)
      ]
    ],

    vehicle_type: this.formBuilder.nonNullable.control<VehicleType>(
      'carro',
      [Validators.required]
    )
  });

  /**
   * Permite consultar fácilmente los errores del campo placa
   * desde el HTML.
   */
  get plateControl() {
    return this.checkInForm.controls.vehicle_plate;
  }

  /**
   * Registra el ingreso del vehículo.
   */
  registerEntry(): void {

    // Evita que el operador envíe dos veces la petición.
    if (this.isSubmitting()) {
      return;
    }

    this.clearFeedback();

    if (this.checkInForm.invalid) {
      this.checkInForm.markAllAsTouched();
      return;
    }

    const formValue = this.checkInForm.getRawValue();

    const payload: CheckInRequest = {
      vehicle_plate: this.normalizePlate(formValue.vehicle_plate),
      vehicle_type: formValue.vehicle_type
    };

    this.isSubmitting.set(true);

    this.parkingService
      .checkIn(payload)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        })
      )
      .subscribe({
        next: (response) => {

          this.successMessage.set(
            response.message || 'Ingreso registrado correctamente.'
          );

          this.registeredEntry.set(response.data);

          this.checkInForm.reset({
            vehicle_plate: '',
            vehicle_type: 'carro'
          });
        },

        error: (error: HttpErrorResponse) => {

          this.errorMessage.set(
            this.getApiErrorMessage(error)
          );
        }
      });
  }

  /**
   * Elimina espacios y convierte la placa a mayúsculas.
   */
  private normalizePlate(plate: string): string {
    return plate.trim().toUpperCase();
  }

  /**
   * Obtiene el mensaje enviado por el backend.
   */
  private getApiErrorMessage(error: HttpErrorResponse): string {

    const apiError = error.error as ApiErrorResponse | undefined;

    if (
      Array.isArray(apiError?.errors) &&
      apiError.errors.length > 0
    ) {
      return apiError.errors.join('. ');
    }

    if (apiError?.message) {
      return apiError.message;
    }

    return 'No fue posible registrar el ingreso del vehículo.';
  }

  /**
   * Limpia los mensajes del registro anterior.
   */
  private clearFeedback(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
    this.registeredEntry.set(null);
  }
}
