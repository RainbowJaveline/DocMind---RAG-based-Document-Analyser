package DocMind.backend.Service;

import DocMind.backend.DTO.DocumentChunkDTO;
import DocMind.backend.DTO.DocumentResponseDTO;
import DocMind.backend.Entity.DocumentMetadata;
import DocMind.backend.Entity.DocumentStatus;
import DocMind.backend.Exception.DocumentProcessingException;
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
import java.util.Map;
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
        List<Document> parseDocument = null;
        Integer chunksCreated = 0;
        try {
            //parse the file
            parseDocument = parserService.parse(file);
            //ingest and return the number of chunks
            chunksCreated = ingestionService.ingest(saveDocumentMetaData, parseDocument);
        } catch (DocumentProcessingException e) {
            repo.delete(documentMetadata);
            throw e;
        }
        return DocumentResponseDTO.builder()
                .id(saveDocumentMetaData.getId())
                .fileName(saveDocumentMetaData.getFilename())
                .fileSize(saveDocumentMetaData.getSize())
                .chunkCreated(chunksCreated)
                .status(saveDocumentMetaData.getStatus())
                .totalPages(saveDocumentMetaData.getTotalPages())
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
                             .totalPages(docs.getTotalPages())
                             .message("File Fetched Successfully from the Database")
                             .build()
             );
         }
         return responseDTOList;
    }

    public DocumentResponseDTO getDocumentById(UUID id) {
        DocumentMetadata documentId = repo.findById(id).orElseThrow(()->new ResourceNotFoundException("Cannot Find the File"));
        List<DocumentChunkDTO> chunks = getDocumentChunks(id);
        return DocumentResponseDTO.builder()
                .id(documentId.getId())
                .status(documentId.getStatus())
                .fileSize(documentId.getSize())
                .chunkCreated(documentId.getTotalChunks())
                .totalPages(documentId.getTotalPages())
                .chunks(chunks)
                .fileName(documentId.getFilename())
                .build();
    }

    @Transactional
    public DocumentResponseDTO deleteById(UUID id) {

        logger.info("Deleting document ID: {}", id);

        // 1. Fetch document metadata
        DocumentResponseDTO docData = getDocumentById(id);

        DocumentMetadata documentMetadata = repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cannot find the file with ID: " + id
                        )
                );

        logger.info("Document metadata ID: {}", documentMetadata.getId());
        logger.info("Document filename: {}", documentMetadata.getFilename());

        try {
            // 2. Count matching vector chunks using both metadata formats
            String countQuery = """
                SELECT COUNT(*)
                FROM vector_store_gemini
                WHERE metadata->>'documentId' = ?
                   OR metadata->>'DocumentId : ' = ?
                """;

            Integer matchingVectors = jdbcTemplate.queryForObject(
                    countQuery,
                    Integer.class,
                    id.toString(),
                    id.toString()
            );

            logger.info(
                    "Matching vectors before deletion: {}",
                    matchingVectors
            );

            // 3. Delete vector chunks
            String deleteQuery = """
                DELETE FROM vector_store_gemini
                WHERE metadata->>'documentId' = ?
                   OR metadata->>'DocumentId : ' = ?
                """;

            int deletedCount = jdbcTemplate.update(
                    deleteQuery,
                    id.toString(),
                    id.toString()
            );

            logger.info(
                    "Deleted {} vectors for DocumentId: {}",
                    deletedCount,
                    id
            );

            // 4. Prevent metadata deletion if existing vectors weren't deleted
            if (matchingVectors != null && deletedCount != matchingVectors) {
                throw new IllegalStateException(
                        "Vector deletion mismatch for document " + id
                                + ". Expected to delete " + matchingVectors
                                + " vectors, but deleted " + deletedCount
                );
            }

            // 5. Delete document metadata only after vector deletion succeeds
            repo.delete(documentMetadata);

            logger.info(
                    "Deleted document metadata for DocumentId: {}",
                    id
            );

            // 6. Return response
            docData.setStatus(DocumentStatus.DELETED);
            return docData;

        } catch (DataAccessException e) {
            logger.error(
                    "Database operation failed while deleting document: {}",
                    id,
                    e
            );
            throw e;
        }
    }


    public List<DocumentChunkDTO> getDocumentChunks(UUID documentId) {

        String sql = """
        SELECT
            id,
            content,
            metadata
        FROM vector_store_gemini
        WHERE metadata->>'documentId' = ?
        ORDER BY (metadata->>'chunkIndex')::INTEGER
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {

            String metadataJson = rs.getString("metadata");
            Map<String, Object> metadata = new java.util.HashMap<>();

            if (metadataJson != null && !metadataJson.isBlank()) {
                try {
                    metadata = new com.fasterxml.jackson.databind.ObjectMapper()
                            .readValue(
                                    metadataJson,
                                    new com.fasterxml.jackson.core.type.TypeReference<
                                            Map<String, Object>>() {}
                            );
                } catch (Exception e) {
                    logger.warn("Could not parse chunk metadata", e);
                }
            }

            Object chunkIndexValue = metadata.get("chunkIndex");
            Integer chunkIndex = chunkIndexValue instanceof Number
                    ? ((Number) chunkIndexValue).intValue()
                    : null;

            Object pageValue = metadata.get("page_number");
            if (pageValue == null) {
                pageValue = metadata.get("pageNumber");
            }
            if (pageValue == null) {
                pageValue = metadata.get("Page Number : ");
            }

            Integer pageNumber = null;
            if (pageValue instanceof Number) {
                pageNumber = ((Number) pageValue).intValue();
            } else if (pageValue != null) {
                try {
                    pageNumber = Integer.parseInt(pageValue.toString());
                } catch (NumberFormatException ignored) {
                    // Leave page number unavailable if the value is not numeric.
                }
            }

            return DocumentChunkDTO.builder()
                    .id(rs.getString("id"))
                    .chunkIndex(chunkIndex)
                    .pageNumber(pageNumber)
                    .snippet(rs.getString("content"))
                    .metadata(metadata)
                    .build();

        }, documentId.toString());
    }
}
