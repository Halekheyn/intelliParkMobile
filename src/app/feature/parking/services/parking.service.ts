import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';

import { map, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

import {
  ApiResponse,
  CheckInRequest,
  ParkingRecord,
  VehicleType
} from '../interfaces/parking.interface';

/**
 * Representa exactamente la respuesta actual del backend.
 *
 * Esta interfaz queda solamente dentro del servicio porque
 * el resto de la aplicación trabajará con ParkingRecord.
 */
interface CheckInApiRecord {
  parkingId: number;
  vehicleId: number;
  plate: string;
  type: VehicleType;
  entryTime: string;
  status: string;
}

type CheckInApiResponse = ApiResponse<CheckInApiRecord>;

@Injectable({
  providedIn: 'root'
})
export class ParkingService {

  private readonly httpClient = inject(HttpClient);

  private readonly apiBaseUrl =
    Capacitor.getPlatform() === 'android'
      ? environment.apiAndroidUrl
      : environment.apiBrowserUrl;

  checkIn(
    payload: CheckInRequest
  ): Observable<ApiResponse<ParkingRecord>> {

    return this.httpClient
      .post<CheckInApiResponse>(
        `${this.apiBaseUrl}/parking/check-in`,
        payload
      )
      .pipe(
        map((response) => ({
          message: response.message,

          data: {
            parking_id: response.data.parkingId,
            vehicle_id: response.data.vehicleId,
            vehicle_plate: response.data.plate,
            vehicle_type: response.data.type,
            parking_entry_time: response.data.entryTime,
            parking_status: response.data.status
          }
        }))
      );
  }
}
