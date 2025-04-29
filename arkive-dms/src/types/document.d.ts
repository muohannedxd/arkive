export type FolderObject = {
   id: number;
   title: string;
   description: string;
   owner: string;
 };

export type DocumentObject = {
   id: number;
   title: string;
   owner: string;
   department: string;
   document: string;
   folder_id?: number;
}