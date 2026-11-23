/** Données envoyées pour créer ou modifier un étudiant (miroir de StudentRequestDTO). */
export interface StudentRequest {
  firstName: string,
  lastName: string,
  email: string,
  birthDate: string // format ISO yyyy-MM-dd
}
