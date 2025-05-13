export interface UserObject {
   id: number;
   name: string;
   email: string;
   phone: string;
   password: string;
   role: string;
   departments: Array<{ id: number, name: string }>;  // Updated from department to departments array
   position: string;
   status: string;
   hire_date: Date;
 }
 
export interface DocumentRequestObject {
   userid: string;
   title: string;
   description: string;
}

export type UserRowObj = {
   personal: [string, string, number]; // [name, email, id]
   phone: string;
   role: string;
   position: string;
   departments: Array<{ id: number, name: string }>;  // Updated from department to departments array
   status: string;
   hire_date: string;
 };