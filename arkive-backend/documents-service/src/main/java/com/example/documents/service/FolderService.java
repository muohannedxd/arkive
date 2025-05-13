package com.example.documents.service;

import com.example.documents.dto.FolderDto;

import java.util.List;

public interface FolderService {
   List<FolderDto> getAllFolders();
   
   List<FolderDto> getFoldersByDepartment(String department);

   FolderDto getFolderById(Long id);

   FolderDto createFolder(FolderDto folderDto);

   FolderDto updateFolder(Long id, FolderDto folderDto);

   void deleteFolder(Long id);
}