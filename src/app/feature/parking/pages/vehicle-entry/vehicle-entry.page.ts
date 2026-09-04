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
  Camera,
  CameraResultType,
  CameraSource
} from '@capacitor/camera';

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
  PlateRecognitionRequest,
  SupportedImageMimeType,
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
  readonly isTakingPhoto = signal(false);
  readonly isRecognizingPlate = signal(false);

  readonly successMessage = signal('');
  readonly errorMessage = signal('');
  readonly recognitionMessage = signal('');
  readonly plateImagePreview = signal('');

  readonly registeredEntry = signal<ParkingRecord | null>(null);

  private imageBase64 = '';
  private imageMimeType: SupportedImageMimeType = 'image/jpeg';

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
   * Abre la cámara del dispositivo y conserva la fotografía en memoria.
   */
  async takePlatePhoto(): Promise<void> {
    if (
      this.isTakingPhoto() ||
      this.isRecognizingPlate() ||
      this.isSubmitting()
    ) {
      return;
    }

    this.errorMessage.set('');
    this.recognitionMessage.set('');
    this.isTakingPhoto.set(true);

    try {
      const photo = await Camera.getPhoto({
        source: CameraSource.Camera,
        resultType: CameraResultType.Base64,
        quality: 75,
        width: 1600,
        allowEditing: false,
        correctOrientation: true,
        saveToGallery: false,
        webUseInput: true,
        promptLabelHeader: 'Fotografía de la placa',
        promptLabelPhoto: 'Tomar fotografía',
        promptLabelCancel: 'Cancelar'
      });

      if (!photo.base64String) {
        throw new Error('La cámara no retornó una imagen válida.');
      }

      this.imageMimeType = this.getImageMimeType(photo.format);
      this.imageBase64 = photo.base64String;

      this.plateImagePreview.set(
        `data:${this.imageMimeType};base64,${this.imageBase64}`
      );
    } catch (error) {
      if (!this.wasCameraCancelled(error)) {
        this.errorMessage.set(
          'No fue posible tomar la fotografía de la placa.'
        );
      }
    } finally {
      this.isTakingPhoto.set(false);
    }
  }

  /**
   * Envía la fotografía al backend y completa el campo de placa.
   */
  recognizePlate(): void {
    if (!this.imageBase64 || this.isRecognizingPlate()) {
      return;
    }

    this.errorMessage.set('');
    this.recognitionMessage.set('');
    this.isRecognizingPlate.set(true);

    const payload: PlateRecognitionRequest = {
      image_base64: this.imageBase64,
      mime_type: this.imageMimeType
    };

    this.parkingService
      .recognizePlate(payload)
      .pipe(
        finalize(() => {
          this.isRecognizingPlate.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          const recognizedPlate = this.normalizePlate(
            response.data.vehicle_plate
          );

          this.checkInForm.patchValue({
            vehicle_plate: recognizedPlate
          });

          this.plateControl.markAsTouched();
          this.plateControl.updateValueAndValidity();

          this.recognitionMessage.set(
            `Gemini reconoció la placa ${recognizedPlate}. Verifique el dato antes de registrar.`
          );
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            this.getApiErrorMessage(
              error,
              'No fue posible reconocer la placa en la fotografía.'
            )
          );
        }
      });
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

          this.resetCapturedPhoto();
        },

        error: (error: HttpErrorResponse) => {

          this.errorMessage.set(
            this.getApiErrorMessage(
              error,
              'No fue posible registrar el ingreso del vehículo.'
            )
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
  private getApiErrorMessage(
    error: HttpErrorResponse,
    fallbackMessage: string
  ): string {

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

    return fallbackMessage;
  }

  private getImageMimeType(format: string): SupportedImageMimeType {
    const normalizedFormat = format.toLowerCase();

    if (normalizedFormat === 'png') {
      return 'image/png';
    }

    if (normalizedFormat === 'webp') {
      return 'image/webp';
    }

    return 'image/jpeg';
  }

  private wasCameraCancelled(error: unknown): boolean {
    const message = error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

    return message.includes('cancel');
  }

  private resetCapturedPhoto(): void {
    this.imageBase64 = '';
    this.imageMimeType = 'image/jpeg';
    this.plateImagePreview.set('');
    this.recognitionMessage.set('');
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
