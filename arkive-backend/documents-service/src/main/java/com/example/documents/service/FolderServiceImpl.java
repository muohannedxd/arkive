package com.example.documents.service;

import com.example.documents.dto.FolderDto;
import com.example.documents.exception.ResourceNotFoundException;
import com.example.documents.model.Department;
import com.example.documents.model.Folder;
import com.example.documents.repository.FolderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FolderServiceImpl implements FolderService {

   private final FolderRepository folderRepository;
   private final DepartmentService departmentService;

   @Override
   public List<FolderDto> getAllFolders() {
      List<Folder> folders = folderRepository.findAll();
      return folders.stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
   }
   
   @Override
   public List<FolderDto> getFoldersByDepartments(List<String> departmentNames) {
      if (departmentNames == null || departmentNames.isEmpty()) {
          return new ArrayList<>();
      }
      
      System.out.println("Searching for folders with departments: " + departmentNames);
      
      // Convert all department names to lowercase for case-insensitive comparison
      List<String> departmentNamesLower = departmentNames.stream()
          .map(String::toLowerCase)
          .collect(Collectors.toList());
      
      // Get folders matching any of the given departments
      List<Folder> folders = folderRepository.findByDepartmentNames(departmentNamesLower);
      System.out.println("Found " + folders.size() + " folders for departments: " + departmentNames);
      
      // Log details about each folder found
      for (Folder folder : folders) {
          System.out.println("Found folder: ID=" + folder.getId() + ", Title=" + folder.getTitle() + 
                           ", Departments=" + folder.getDepartments().stream().map(Department::getName).collect(Collectors.toList()));
      }
      
      return folders.stream()
            .sorted(Comparator.comparing(Folder::getCreatedAt).reversed())
            .map(this::mapToDto)
            .collect(Collectors.toList());
   }

   @Override
   public FolderDto getFolderById(Long id) {
      Folder folder = folderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Folder not found with id: " + id));
      return mapToDto(folder);
   }

   @Override
   @Transactional
   public FolderDto createFolder(FolderDto folderDto) {
      Folder folder = mapToEntity(folderDto);
      
      // Set the departments for the folder
      if (folderDto.getDepartments() != null && !folderDto.getDepartments().isEmpty()) {
          List<Department> departments = departmentService.findOrCreateDepartments(folderDto.getDepartments());
          folder.getDepartments().addAll(departments);
      }
      
      Folder savedFolder = folderRepository.save(folder);
      return mapToDto(savedFolder);
   }

   @Override
   @Transactional
   public FolderDto updateFolder(Long id, FolderDto folderDto) {
      Folder folder = folderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Folder not found with id: " + id));

      folder.setTitle(folderDto.getTitle());
      
      // Update departments if provided
      if (folderDto.getDepartments() != null) {
          folder.getDepartments().clear();
          if (!folderDto.getDepartments().isEmpty()) {
              List<Department> departments = departmentService.findOrCreateDepartments(folderDto.getDepartments());
              folder.getDepartments().addAll(departments);
          }
      }
      
      Folder updatedFolder = folderRepository.save(folder);
      return mapToDto(updatedFolder);
   }

   @Override
   @Transactional
   public void deleteFolder(Long id) {
      if (!folderRepository.existsById(id)) {
         throw new ResourceNotFoundException("Folder not found with id: " + id);
      }
      folderRepository.deleteById(id);
   }

   private FolderDto mapToDto(Folder folder) {
      FolderDto folderDto = new FolderDto();
      folderDto.setId(folder.getId());
      folderDto.setTitle(folder.getTitle());
      folderDto.setDepartment(folder.getDepartment()); // Map the temporary department field
      folderDto.setCreatedAt(folder.getCreatedAt());
      folderDto.setUpdatedAt(folder.getUpdatedAt());
      
      // Map departments
      if (folder.getDepartments() != null) {
          folderDto.setDepartments(
              folder.getDepartments().stream()
                  .map(Department::getName)
                  .collect(Collectors.toList())
          );
      }
      
      return folderDto;
   }

   private Folder mapToEntity(FolderDto folderDto) {
      Folder folder = new Folder();
      folder.setTitle(folderDto.getTitle());
      
      // Set the temporary department field to support the database constraint
      if (folderDto.getDepartments() != null && !folderDto.getDepartments().isEmpty()) {
          folder.setDepartment(folderDto.getDepartments().get(0));
      } else if (folderDto.getDepartment() != null) {
          folder.setDepartment(folderDto.getDepartment());
      } else {
          // Default to empty string to avoid null constraint violation
          folder.setDepartment("");
      }
      
      return folder;
   }
}