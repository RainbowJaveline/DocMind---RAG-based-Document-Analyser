package DocMind.backend.Service;

import DocMind.backend.DTO.DocumentResponseDTO;
import DocMind.backend.Entity.DocumentMetadata;
import DocMind.backend.Entity.DocumentStatus;
import DocMind.backend.Repository.DocumentMetaDataRepo;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class DocumentService {

    private final ParserService parserService;
    private final IngestionService ingestionService;
    private final DocumentMetaDataRepo repo;
    private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);
    private JdbcTemplate jdbcTemplate;

    //Method to Upload and Parse Documents
    public DocumentResponseDTO uploadDocument(MultipartFile file){
        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String contentType = file.getContentType()!=null ? file.getContentType() : "application/octat-stream";
        //Create DocumentMetaData
        DocumentMetadata documentMetadata = DocumentMetadata
                .builder()
                .filename(fileName)
                .contentType(contentType)
                .size(file.getSize())
                .status(DocumentStatus.UPLOADING)
                .createdAt(LocalDateTime.now())
                .build();

        //save the MetaData for the Document
        DocumentMetadata saveDocumentMetaData =  repo.save(documentMetadata);

        //parse the file
        List<Document> parseDocument = parserService.parse(file);
        //ingest and return the number of chunks
        Integer chunksCreated = ingestionService.ingest(saveDocumentMetaData,parseDocument);

        return DocumentResponseDTO.builder()
                .id(documentMetadata.getId())
                .fileName(documentMetadata.getFilename())
                .fileSize(documentMetadata.getSize())
                .chunkCreated(chunksCreated)
                .status(documentMetadata.getStatus())
                .message("Document Successfully Processed and Indexed")
                .build();

    }

    public List<DocumentResponseDTO> uploadMultipleDocument(List<MultipartFile> files) {

        List<DocumentResponseDTO> responseDTOList = new ArrayList<>();

        for (MultipartFile file : files){
            responseDTOList.add(uploadDocument(file));
        }

        return responseDTOList;
    }

    public List<DocumentResponseDTO> getAllDocuments() {
        List<DocumentResponseDTO> responseDTOList = new ArrayList<>();
         List<DocumentMetadata> documentMetadata = repo.findAll();
         for (DocumentMetadata docs : documentMetadata){
             responseDTOList.add(
                     DocumentResponseDTO.builder()
                             .id(docs.getId())
                             .status(docs.getStatus())
                             .fileSize(docs.getSize())
                             .chunkCreated(docs.getTotalChunks())
                             .fileName(docs.getFilename())
                             .build()
             );
         }
         return responseDTOList;
    }

    public DocumentResponseDTO getDocumentById(UUID id) {
        DocumentMetadata documentId = repo.getReferenceById(id);
        return DocumentResponseDTO.builder()
                .id(documentId.getId())
                .status(documentId.getStatus())
                .fileSize(documentId.getSize())
                .chunkCreated(documentId.getTotalChunks())
                .fileName(documentId.getFilename())
                .build();
    }
}
