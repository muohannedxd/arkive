package com.example.documents.service;

import com.example.documents.dto.FolderDto;

import java.util.List;

public interface FolderService {
   List<FolderDto> getAllFolders();
   
   // Removed legacy getFoldersByDepartment method
   
   // Method to get folders by multiple departments
   List<FolderDto> getFoldersByDepartments(List<String> departmentNames);

   FolderDto getFolderById(Long id);

   FolderDto createFolder(FolderDto folderDto);

   FolderDto updateFolder(Long id, FolderDto folderDto);

   void deleteFolder(Long id);
}