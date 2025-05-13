export type FolderObject = {
   id: number;
   title: string;
   departments: string[];
   createdAt: string;
   updatedAt: string;
 };

export type DocumentObject = {
   id: number;
   title: string;
   owner: string;
   departments: string[];
   document: string;
   folder_id?: number;
}