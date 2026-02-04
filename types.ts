
export enum UserRole {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  COBRADOR = 'COBRADOR'
}

export enum LoanStatus {
  ACTIVO = 'ACTIVO',
  AL_DIA = 'AL_DIA',
  ATRASADO = 'ATRASADO',
  VENCIDO = 'VENCIDO',
  CANCELADO = 'CANCELADO'
}

export enum LoanFrequency {
  DIARIO = 'DIARIO',
  SEMANAL = 'SEMANAL',
  MENSUAL = 'MENSUAL'
}

export enum ClientStatus {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  MOROSO = 'MOROSO',
  BLOQUEADO = 'BLOQUEADO'
}

export enum ClientType {
  NORMAL = 'NORMAL',
  ESPECIAL = 'ESPECIAL',
  RIESGOSO = 'RIESGOSO'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

export interface Route {
  id: string;
  name: string;
  description?: string;
}

export interface Client {
  id: string;
  name: string;
  nickname?: string;
  phones: string[];
  document_id: string;
  address: string;
  reference?: string;
  photo_url?: string;
  id_photo_url?: string;
  status: ClientStatus;
  type: ClientType;
  route_id?: string;
  collector_id?: string;
  created_at?: string;
}

export interface Loan {
  id: string;
  client_id: string;
  amount: number;
  total_to_pay: number; 
  interest: number; 
  installments: number;
  installment_value: number;
  frequency: LoanFrequency;
  start_date: string;
  end_date?: string;
  status: LoanStatus;
  balance: number;
  late_fee: number;
  collector_id: string;
  created_at?: string;
  clients?: { name: string; nickname: string; address: string }; 
}

export interface Payment {
  id: string;
  loan_id: string;
  client_id: string;
  amount: number;
  payment_date: string;
  type: 'COMPLETO' | 'PARCIAL' | 'ABONO' | 'NO_PAGO';
  evidence_url?: string;
  observation?: string;
  latitude?: number;
  longitude?: number;
  collector_id: string;
}
