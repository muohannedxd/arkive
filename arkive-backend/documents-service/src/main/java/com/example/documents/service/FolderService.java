package com.example.documents.service;

import com.example.documents.dto.FolderDto;

import java.util.List;

public interface FolderService {
   List<FolderDto> getAllFolders();
   
   // Get folders by a single department name
   List<FolderDto> getFoldersByDepartment(String departmentName);
   
   // Method to get folders by multiple departments (for users with multiple departments)
   List<FolderDto> getFoldersByDepartments(List<String> departmentNames);

   FolderDto getFolderById(Long id);

   FolderDto createFolder(FolderDto folderDto);

   FolderDto updateFolder(Long id, FolderDto folderDto);

   void deleteFolder(Long id);
}