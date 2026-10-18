package DocMind.backend.Service;

import DocMind.backend.DTO.DocumentResponseDTO;
import DocMind.backend.Entity.DocumentMetadata;
import DocMind.backend.Entity.DocumentStatus;
import DocMind.backend.Exception.ResourceNotFoundException;
import DocMind.backend.Repository.DocumentMetaDataRepo;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    private final JdbcTemplate jdbcTemplate;

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

        logger.info(
                "Upload response: id={}, status={}, chunks={}",
                saveDocumentMetaData.getId(),
                saveDocumentMetaData.getStatus(),
                saveDocumentMetaData.getTotalChunks()
        );

        return DocumentResponseDTO.builder()
                .id(saveDocumentMetaData.getId())
                .fileName(saveDocumentMetaData.getFilename())
                .fileSize(saveDocumentMetaData.getSize())
                .chunkCreated(chunksCreated)
                .status(saveDocumentMetaData.getStatus())
                .message(
                        saveDocumentMetaData.getStatus() == DocumentStatus.INDEXED
                                ? "Document successfully processed and indexed"
                                : saveDocumentMetaData.getErrorMessage()
                )
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
                             .message("File Fetched Successfully from the Database")
                             .build()
             );
         }
         return responseDTOList;
    }

    public DocumentResponseDTO getDocumentById(UUID id) {
        DocumentMetadata documentId = repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Cannot Find the File"));
        return DocumentResponseDTO.builder()
                .id(documentId.getId())
                .status(documentId.getStatus())
                .fileSize(documentId.getSize())
                .chunkCreated(documentId.getTotalChunks())
                .fileName(documentId.getFilename())
                .build();
    }

    @Transactional
    public void deleteById(UUID id) {

        DocumentMetadata documentMetadata = repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cannot find the file"));

        String query = """
            DELETE FROM vector_store_gemini
            WHERE metadata->>'documentId' = ?
            """;

        try {
            int deletedCount = jdbcTemplate.update(query, id.toString());

            logger.info("Deleted {} vectors for DocumentId: {}",
                    deletedCount, id);

            repo.delete(documentMetadata);

            logger.info("Deleted document metadata for DocumentId: {}", id);

        } catch (DataAccessException e) {
            logger.error("Database operation failed while deleting document: {}", id, e);
            throw e;
        }
    }
}
