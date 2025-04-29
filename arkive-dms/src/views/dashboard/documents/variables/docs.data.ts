import Image from "assets/img/nfts/Nft5.png";
import PDF from "assets/dummy_docs/LAB_2_START.pdf";
import CSV from "assets/dummy_docs/hello.csv";
import TXT from "assets/dummy_docs/hello.txt";
import DOCX from "assets/dummy_docs/hello.docx";
import XLSX from "assets/dummy_docs/hello.xlsx";

import { DocumentObject } from "types/document";

export const documents: DocumentObject[] = [
  {
   id: 1,
    title: "ETH AI Brain",
    owner: "Juan Smith",
    document: Image,
    department: "Sales",
  },
  {
    id: 2,
    title: "Lab 2 Start",
    owner: "Professor",
    document: PDF,
    department: "Information Technology",
  },
  {
    id: 3,
    title: "hello.txt",
    owner: "Manager",
    document: TXT,
    department: "Human Resources",
  },
  {
    id: 4,
    title: "hello.csv",
    owner: "Data Scientist",
    document: CSV,
    department: "Information Technology",
  },
  {
    id: 5,
    title: "hello.docx",
    owner: "Manager",
    document: DOCX,
    department: "Information Technology",
  },
  {
    id: 6,
    title: "hello.xlsx",
    owner: "Manager",
    document: XLSX,
    department: "Information Technology",
  }
];
