export interface Address {
  id?: string;
  houseHold: string;
  commune: string;
  municipality: string;
  province: string;
  country: string;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Area {
  id?: string;
  name: string;
  employeeId?: string;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthCredentials {
  phone: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  phone: string;
  status: boolean;
  role: string;
  permissions: string[];
  companyId: string;
  isGlobalAdmin: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface Car {
  id?: string;
  cod: string;
  mark: string;
  model: string;
  capacity: number;
  containerId: string;
  geoLocationId: string | null;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PhoneNumber {
  phone: string;
}

export interface Contact {
  id?: string;
  phoneNumbers: PhoneNumber[];
  email: string;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Company {
  id?: string;
  cod: string;
  taxName: string;
  businessName: string;
  nif: string;
  photo: string;
  status: boolean;
  hasExistedSince: string;
  contactId?: string;
  addressId?: string;
  address?: Address;
  contact?: Contact;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanyPayload {
  cod: string;
  taxName: string;
  businessName: string;
  nif: string;
  photo?: string;
  status: boolean;
  hasExistedSince: string;
  address: Address;
  contact: Contact;
}

export interface UpdateCompanyPayload {
  id: string;
  taxName: string;
  businessName: string;
  nif: string;
  photo?: string;
  contactId?: string;
  addressId?: string;
  status: boolean;
  hasExistedSince?: string;
}

export interface User {
  id?: string;
  phone: string;
  status: boolean;
  companyId?: string;
  isGlobalAdmin: boolean;
  createdAt?: string;
  updatedAt?: string;
  roleId?: string;
  password?: string;
  permissions?: string[];
  employee?: Employee | null;
}

export interface CreateUserPayload {
  phone: string;
  password: string;
  isGlobalAdmin: boolean;
  status: boolean;
  companyId?: string;
  departmentId?: string;
  roleId?: string;
}

export interface UpdateUserPayload {
  id: string;
  phone: string;
  password?: string;
  isGlobalAdmin: boolean;
  status: boolean;
  companyId?: string;
  departmentId?: string;
  roleId?: string;
}

export interface Container {
  id?: string;
  cod: string;
  mark: string;
  model: string;
  capacity: number;
  containerId?: string;
  status: boolean;
  companyId: string;
  geoLocationEntityId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id?: string;
  cod: string;
  name: string;
  taxName: string;
  photo: string;
  nif: string;
  contactId?: string;
  addressId?: string;
  address?: Address;
  contact?: Contact;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  id?: string;
  name: string;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee {
  id?: string;
  cod: string;
  companyId: string;
  fullName: string;
  photo: string;
  function: string;
  contactId?: string;
  addressId?: string;
  contact?: Contact;
  address?: Address;
  siteId: string;
  userId: string;
  departmentId: string;
  createdAt?: string;
  updatedAt?: string;
  department?: Department | null;
}

export interface Equipment {
  id?: string;
  serialNumber: string;
  status: boolean;
  mark: string;
  model: string;
  siteId: string;
  typeEquipmentId: string;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
  
}

export interface Module {
  id?: string;
  name: string;
  description: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Site {
  id?: string;
  cod: string;
  name: string;
  numberWorkersContract: number;
  customerId: string;
  areaId: string;
  contactId: string;
  addressId: string;
  sectorId: string;
  zoneId: string;
  companyId: string;
  geoLocationId: string | null | undefined;
  createdAt?: string;
  updatedAt?: string;
  customer?: Customer;
  customers?: Customer | (Customer | null)[];
  address?: Address;
  addresses?: Address | (Address | null)[];
  zone?: Zone;
  zones?: Zone | (Zone | null)[];
  area?: Area;
  areas?: Area | (Area | null)[];
  sector?: Sector;
  sectors?: Sector | (Sector | null)[];
  contact?: Contact;
  contacts?: Contact | (Contact | null)[];
}

export interface Occorrence {
  id?: string;
  cod: string;
  description: string;
  companyId: string;
  typeOccorrenceId: string;
  equipmentId: string;
  employeeId: string;
  siteId: string;
  time: string;
  correctiveAction: string;
  gravity: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  id?: string;
  name: string;
  description: string;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RolePermission {
  id?: string;
  rolesId: string;
  permissionsId: string;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  id?: string;
  name: string;
  description: string;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sector {
  id?: string;
  name: string;
  employeeId: string;
  zoneId: string;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Supervision {
  id?: string;
  cod: string;
  observation: string | undefined;
  companyId: string;
  desiredNumberWorkers: number;
  equipmentId: string;
  employeeId: string;
  siteId: string;
  time: string;
  numberWorkerPresent: number;
  departmentId: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TypeEquipment {
  id?: string;
  name: string;
  description?: string;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Zone {
  id?: string;
  name: string;
  employeeId: string | undefined;
  companyId: string;
  areaId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateZonePayload {
  name: string;
  companyId: string;
  employeeId?: string;
  areaId: string;
}

export interface TypeOccorrence {
  id?: string;
  cod: string;
  description: string;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}


