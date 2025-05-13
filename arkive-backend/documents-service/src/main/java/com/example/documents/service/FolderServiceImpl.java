package com.example.documents.service;

import com.example.documents.dto.FolderDto;
import com.example.documents.exception.ResourceNotFoundException;
import com.example.documents.model.Department;
import com.example.documents.model.Folder;
import com.example.documents.repository.FolderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
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
    public List<FolderDto> getFoldersByDepartment(String departmentName) {
        if (departmentName == null || departmentName.isEmpty()) {
            return new ArrayList<>();
        }
      
        List<Folder> folders = folderRepository.findByDepartmentName(departmentName);
        log.info("Found {} folders for department: {}", folders.size(), departmentName);
      
        return folders.stream()
                .sorted(Comparator.comparing(Folder::getCreatedAt).reversed())
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
   
    @Override
    public List<FolderDto> getFoldersByDepartments(List<String> departmentNames) {
        if (departmentNames == null || departmentNames.isEmpty()) {
            return new ArrayList<>();
        }
      
        log.info("Searching for folders with departments: {}", departmentNames);
      
        List<Folder> folders = folderRepository.findByDepartmentNamesIn(departmentNames);
        log.info("Found {} folders for departments: {}", folders.size(), departmentNames);
      
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
        log.info("Creating folder with title: {} and department: {}", folderDto.getTitle(), folderDto.getDepartment());
      
        if (folderDto.getTitle() == null || folderDto.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Folder title must not be empty");
        }

        if (folderDto.getDepartment() == null || folderDto.getDepartment().trim().isEmpty()) {
            throw new IllegalArgumentException("Department must be specified for a folder");
        }

        try {
            Department department = departmentService.findOrCreateDepartment(folderDto.getDepartment().trim());
            if (department == null || department.getId() == null) {
                throw new IllegalStateException("Failed to create or find department: " + folderDto.getDepartment());
            }

            Folder folder = new Folder();
            folder.setTitle(folderDto.getTitle().trim());
            folder.setDepartment(department);
            folder.setCreatedAt(LocalDateTime.now());
            folder.setUpdatedAt(LocalDateTime.now());

            Folder savedFolder = folderRepository.save(folder);
            log.info("Folder saved successfully with ID: {} in department: {}", savedFolder.getId(), department.getName());
          
            return mapToDto(savedFolder);
        } catch (Exception e) {
            log.error("Error creating folder: {}", e.getMessage(), e);
            throw new IllegalStateException("Failed to create folder: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public FolderDto updateFolder(Long id, FolderDto folderDto) {
        Folder folder = folderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found with id: " + id));

        if (folderDto.getTitle() != null && !folderDto.getTitle().trim().isEmpty()) {
            folder.setTitle(folderDto.getTitle().trim());
        }
      
        if (folderDto.getDepartment() != null && !folderDto.getDepartment().trim().isEmpty()) {
            log.info("Updating folder with department: {}", folderDto.getDepartment());
            Department department = departmentService.findOrCreateDepartment(folderDto.getDepartment().trim());
            folder.setDepartment(department);
        }

        folder.setUpdatedAt(LocalDateTime.now());
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
        
        if (folder.getDepartment() != null) {
            folderDto.setDepartment(folder.getDepartment().getName());
        }
        
        folderDto.setCreatedAt(folder.getCreatedAt());
        folderDto.setUpdatedAt(folder.getUpdatedAt());
        
        return folderDto;
    }
}