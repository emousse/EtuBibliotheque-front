/** Étudiant renvoyé par l'API (miroir de StudentResponseDTO). */
export interface Student {
  id: number,
  firstName: string,
  lastName: string,
  email: string,
  birthDate: string // format ISO yyyy-MM-dd
}
