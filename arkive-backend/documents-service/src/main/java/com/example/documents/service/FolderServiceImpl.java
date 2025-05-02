package com.example.documents.service;

import com.example.documents.dto.FolderDto;
import com.example.documents.exception.ResourceNotFoundException;
import com.example.documents.model.Folder;
import com.example.documents.repository.FolderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FolderServiceImpl implements FolderService {

   private final FolderRepository folderRepository;

   @Override
   public List<FolderDto> getAllFolders() {
      List<Folder> folders = folderRepository.findAll();
      return folders.stream()
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
      Folder savedFolder = folderRepository.save(folder);
      return mapToDto(savedFolder);
   }

   @Override
   @Transactional
   public FolderDto updateFolder(Long id, FolderDto folderDto) {
      Folder folder = folderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Folder not found with id: " + id));

      folder.setTitle(folderDto.getTitle());

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
      folderDto.setCreatedAt(folder.getCreatedAt());
      folderDto.setUpdatedAt(folder.getUpdatedAt());
      return folderDto;
   }

   private Folder mapToEntity(FolderDto folderDto) {
      Folder folder = new Folder();
      folder.setTitle(folderDto.getTitle());
      return folder;
   }
}