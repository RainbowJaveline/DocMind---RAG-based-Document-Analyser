package DocMind.backend.Service;

import DocMind.backend.Entity.DocumentMetadata;
import DocMind.backend.Entity.DocumentStatus;
import DocMind.backend.Exception.DocumentProcessingException;
import DocMind.backend.Repository.DocumentMetaDataRepo;
import DocMind.backend.config.AppProperties;
import com.knuddels.jtokkit.api.EncodingType;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class IngestionService {

    private final DocumentMetaDataRepo repo;
    private final static Logger log = LoggerFactory.getLogger(IngestionService.class);
    private final VectorStore vectorStore;
    private final AppProperties appProperties;
    public Integer ingest(DocumentMetadata saveDocumentMetaData, List<Document> parseDocument) {
        log.info("Ingesting Document : [id={},name={},size={}]",saveDocumentMetaData.getId(),saveDocumentMetaData.getFilename(),saveDocumentMetaData.getSize());
        try{

            saveDocumentMetaData.setStatus(DocumentStatus.PROCESSING);
            saveDocumentMetaData.setTotalPages(parseDocument.size());

            //1. Text chunking using TokenTextSplitter
            TokenTextSplitter tokenTextSplitter = TokenTextSplitter.builder()
                    .withChunkSize(appProperties.getRag().getChunkSize())
                    .withMinChunkSizeChars(appProperties.getRag().getMinChunkSizeChar())
                    .withMinChunkLengthToEmbed(appProperties.getRag().getMinChunkLengthToEmbed())
                    .withMaxNumChunks(appProperties.getRag().getMaxNumChunks())
                    .withKeepSeparator(true)
                    .build();

            List<Document> chunks = tokenTextSplitter.apply(parseDocument);
            if(chunks.isEmpty()){
                saveDocumentMetaData.setStatus(DocumentStatus.FAILED);
                saveDocumentMetaData.setErrorMessage("document cannot be Read or it is Unscannable");
                return 0;
            }

            //2. Enriching the Chunks
            List<Document> enrichChunks = new ArrayList<>();
            for (int i = 0; i < chunks.size(); i++) {
                Document chunk = chunks.get(i);
                Map<String, Object> enrichedMetaData = new HashMap<>(chunk.getMetadata());
                enrichedMetaData.put("DocumentId : ", saveDocumentMetaData.getId().toString());
                enrichedMetaData.put("FileName : ", saveDocumentMetaData.getFilename());
                enrichedMetaData.put("Content-Type : ", saveDocumentMetaData.getContentType());
                enrichedMetaData.put("ChunkIndex : ", i);
                //Preserve or calculate Page number if available
                Object pageNumber = chunk.getMetadata().get("page_number");
                if(pageNumber==null){
                    pageNumber = chunk.getMetadata().get("pageNumber");
                }

                if(pageNumber!=null){
                    enrichedMetaData.put("Page Number : ",pageNumber );
                }

                Document enrichedDoc = new Document(chunk.getText(),enrichedMetaData);
                enrichChunks.add(enrichedDoc);
            }

            //3. Write Chunks and Embeddings to pg vector
            log.info("Writing {} vector chunks to PgVectorStore for Document: {}", enrichChunks.size(),saveDocumentMetaData.getFilename());
            vectorStore.add(enrichChunks);

            //4. Update Documents Status to Index
            saveDocumentMetaData.setStatus(DocumentStatus.INDEXED);
            saveDocumentMetaData.setTotalChunks(enrichChunks.size());
            saveDocumentMetaData.setErrorMessage(null);
            repo.save(saveDocumentMetaData);
            log.info("Successfully Indexed Document [Id: {} , Name: {} , Size: {}]", saveDocumentMetaData.getId(),saveDocumentMetaData.getFilename(),saveDocumentMetaData.getSize());
            return enrichChunks.size();

        }catch (Exception ex) {
            saveDocumentMetaData.setStatus(DocumentStatus.FAILED);
            saveDocumentMetaData.setErrorMessage(ex.getMessage());
            repo.save(saveDocumentMetaData);
            throw new DocumentProcessingException(ex.getMessage());
        }
    }
}
