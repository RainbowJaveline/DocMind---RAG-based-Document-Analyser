package DocMind.backend.Controller;

import DocMind.backend.DTO.ApiResponse;
import DocMind.backend.DTO.DocumentChunkDTO;
import DocMind.backend.DTO.DocumentResponseDTO;
import DocMind.backend.Entity.DocumentMetadata;
import DocMind.backend.Repository.DocumentMetaDataRepo;
import DocMind.backend.Service.DocumentService;
import com.google.protobuf.Api;
import io.swagger.v3.oas.annotations.Operation;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Controller
@RequestMapping("/api/v1/document")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final DocumentMetaDataRepo repo;

    @Operation(
            summary = "Document uploading endpoint",
            description = "upload any multipart pdf"
    )
    @PostMapping(value = "/upload",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DocumentResponseDTO>> uploadDocument(
            @RequestPart("file")MultipartFile file
            ){
        DocumentResponseDTO documentResponseDTO = documentService.uploadDocument(file);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<DocumentResponseDTO>builder()
                        .success(true)
                        .message("File Uploaded Successfully")
                        .timestamp(LocalDateTime.now())
                        .data(DocumentResponseDTO.builder()
                                .id(documentResponseDTO.getId())
                                .fileName(documentResponseDTO.getFileName())
                                .fileSize(documentResponseDTO.getFileSize())
                                .status(documentResponseDTO.getStatus())
                                .message(documentResponseDTO.getMessage())
                                .chunkCreated(documentResponseDTO.getChunkCreated())
                                .build())
                        .build());
    }

    @PostMapping(value = "upload-multiple" , consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Upload and Parse Multiple Documents simultaneously",
            description = "This API is used to Upload Multiple Documents"
    )
   public ResponseEntity<ApiResponse<List<DocumentResponseDTO>>> uploadMultiple(
           @RequestParam("files") List<MultipartFile> files
   ){
       List<DocumentResponseDTO> responseDTOS =  documentService.uploadMultipleDocument(files);
       return ResponseEntity.status(HttpStatus.CREATED)
               .body(
                       ApiResponse.<List<DocumentResponseDTO>>
                               builder()
                               .message("Uploaded Successfully")
                               .data(responseDTOS)
                               .success(true)
                               .build()
               );
   }

   //list all uploaded documents
    @Operation(
            summary = "Getting list of Documents available in the vector store"
    )
    @GetMapping(value = "listDocumets")
    public ResponseEntity<ApiResponse<List<DocumentResponseDTO>>> ListDocument(){
     List<DocumentResponseDTO> docs = documentService.getAllDocuments();
     return ResponseEntity.status(HttpStatus.OK)
             .body(
                     ApiResponse.<List<DocumentResponseDTO>>builder()
                             .data(docs)
                             .timestamp(LocalDateTime.now())
                             .build()
             );
    }

    @Operation(
            summary = "Fetching the document by Id"
    )
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentResponseDTO>> DocumentById(@PathVariable UUID id){
        DocumentResponseDTO document = documentService.getDocumentById(id);
        return ResponseEntity.ok()
                .body(
                        ApiResponse.<DocumentResponseDTO>builder()
                                .message("Got the File")
                                .success(true)
                                .data(document)
                                .build()
                );
    }

    @Operation(
            summary = "Deleting document by ID"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentResponseDTO>> DeleteById(@PathVariable UUID id ){
        //DocumentResponseDTO deleteDocData = documentService.getDocumentById(id);
        DocumentResponseDTO deleteDocData = documentService.deleteById(id);
        return ResponseEntity.ok(
                ApiResponse.<DocumentResponseDTO>builder()
                        .message("Document Deleted Successfully")
                        .success(true)
                        .timestamp(LocalDateTime.now())
                        .data(deleteDocData)
                        .build()
        );
    }


    @GetMapping("/{id}/chunks")
    public ResponseEntity<ApiResponse<List<DocumentChunkDTO>>> getDocumentChunks(
            @PathVariable UUID id) {

        List<DocumentChunkDTO> chunks = documentService.getDocumentChunks(id);

        return ResponseEntity.ok(
                ApiResponse.<List<DocumentChunkDTO>>builder()
                        .success(true)
                        .message("Document chunks fetched successfully")
                        .data(chunks)
                        .build()
        );
    }
}
