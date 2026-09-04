export type VehicleType = 'carro' | 'moto';
export type SupportedImageMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp';

/**
 * Información que la aplicación móvil envía a la API.
 */
export interface CheckInRequest {
  vehicle_plate: string;
  vehicle_type: VehicleType;
}

/**
 * Imagen que se envía temporalmente al backend para reconocer la placa.
 */
export interface PlateRecognitionRequest {
  image_base64: string;
  mime_type: SupportedImageMimeType;
}

/**
 * Resultado retornado por Gemini a través del backend.
 */
export interface PlateRecognitionResult {
  vehicle_plate: string;
}

/**
 * Información que retorna la API después de registrar el ingreso.
 *
 * Importante:
 * La API retorna estas propiedades en camelCase.
 */
export interface ParkingRecord {
  parking_id: number;
  vehicle_id?: number;
  vehicle_plate?: string;
  vehicle_type?: VehicleType;
  parking_entry_time?: string;
  parking_exit_time?: string | null;
  parking_total_minutes?: number | null;
  parking_total_amount?: number | string | null;
  parking_amount?: number | string | null;
  parking_status?: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  message?: string;
  errors?: string[];
}
