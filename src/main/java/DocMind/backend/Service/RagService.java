package DocMind.backend.Service;

import DocMind.backend.DTO.*;
import DocMind.backend.config.AppProperties;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.CurrentTimestamp;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RagService {
    private static final Logger logger = LoggerFactory.getLogger(RagService.class);

    private final VectorStore vectorStore;
    private final AppProperties appProperties;
    private final ChatClient chatClient;


    //to ask anything related to the Documents...
    public ChatResponseDTO askQuestion(ChatRequestDTO request){
        long startTime = System.currentTimeMillis();

        long retrievalStart = System.currentTimeMillis();
        List<Document> documentList =  retrieveRelevantDocuments(
                request.getQuestion(),
                request.getDocumentId(),
                request.getTopK(),
                request.getMinSimilarity()
        );
        long retrievalTime = System.currentTimeMillis() - retrievalStart;
        List<CitationDTO> citationList = documentList.stream()
                .map(this::mapToCitation)
                .toList();

        String contextText = buildeContextString(documentList);
        String prompt = buildPrompt(request.getQuestion() , contextText);
        long generationStart = System.currentTimeMillis();
        String answer = this.chatClient.prompt()
                .user(prompt)
                .call()
                .content();
        long generationTime = System.currentTimeMillis() - generationStart;
        long responseTime = System.currentTimeMillis() - startTime;

        logger.info("RAG retrieval time: {} ms", retrievalTime);
        logger.info("Gemini generation time: {} ms", generationTime);
        logger.info("Total response time: {} ms", responseTime);

        return ChatResponseDTO.builder()
                .answer(answer)
                .conversationId(request.getConversationId()!= null ? request.getConversationId() :  UUID.randomUUID().toString())
                .citations(citationList)
                .responseTimeMs(responseTime)
                .build();
    }

    //to stream the answer to the Question...
    public Flux<String> streamQuestionAnswer(ChatRequestDTO request){
        logger.info("Streaming query : '{}'" , request.getQuestion());
        List<Document> relevantDocuments = retrieveRelevantDocuments(
                request.getQuestion(),
                request.getDocumentId(),
                request.getTopK(),
                request.getMinSimilarity()
        );
        String buildeContextString = buildeContextString(relevantDocuments);
        String buildPrompt = buildPrompt(request.getQuestion(), buildeContextString);
        return chatClient.prompt()
                .user(buildPrompt)
                .stream()
                .content();
    }

    private String buildPrompt(String question, String contextText) {
        if(contextText != null && !contextText.isBlank()){
            return String.format("""
                     Document Context:
                           ---------------------
                           %s
                           ---------------------                                        
                           User Message / Question: %s             
                           Instructions:
                           - If the user's question relates to the document context above, prioritize answering using that context and reference key sections.
                           - If the user is asking a general question, greeting, or discussing topics beyond the document context, respond helpfully and conversationally using your general knowledge while weaving in relevant document context if applicable
                    
                    """, contextText, question);
        }else{
            return String.format("""
                    User Message / Question : %s
                    
                    Instructions:
                    - Respond helpfully , accurately , and conversationally to the user's message using your broad knowledge base.
                    """ , question
            );
        }
    }

    private String buildeContextString(List<Document> documentList) {
        if(documentList == null || documentList.isEmpty()){
            return "";
        }
        return documentList.stream()
                .map(document -> {
                    String fileName = (String) document.getMetadata().getOrDefault("fileName" , "Unknown");
                    Object page = document.getMetadata().getOrDefault("pageNumber", "N/A");
                    return String.format("[Source: %s | Page: %s]\n%s" , fileName , page , document.getText());
                })
                .collect(Collectors.joining("\n\n---\n\n"));
    }

    public SearchResultDTO similarChunks(SearchRequestDTO request){

        //method
        List<Document> documentList = retrieveRelevantDocuments(
                request.getQuery(),
                request.getDocumentId(),
                request.getTopK(),
                request.getSimilaritySearch()
        );

        List<CitationDTO> citationDTOList = documentList.stream()
                .map(this::mapToCitation)
                .toList();

        return SearchResultDTO.builder()
                .query(request.getQuery())
                .totalMatches(citationDTOList.size())
                .matches(citationDTOList)
                .build();
    }

    private CitationDTO mapToCitation(Document document) {
        Map<String , Object> meta = document.getMetadata();
        UUID docId = null;
        if(meta.get("documentId")!= null){
            try{
                docId = UUID.fromString(meta.get("documentId").toString());
            }catch (Exception ignore){

            }
        }

        Integer chunkIndex = null;
        if (meta.get("chunkIndex") instanceof Number n){
            chunkIndex = n.intValue();
        }

        Integer pageNumber = null ;
        if (meta.get("pageNumber") instanceof Number n){
            pageNumber = n.intValue();
        }else if (meta.get("page_number") instanceof Number n){
            pageNumber = n.intValue();
        }

        Double score = null;
        if (meta.get("distance") instanceof Number n ){
            score = 1.0 - n.doubleValue();
        }
        return CitationDTO.builder()
                .id(docId)
                .fileName((String) meta.getOrDefault("fileName" , "Unknown"))
                .chunkIndex(chunkIndex)
                .pageNumber(pageNumber)
                .snippet(document.getText())
                .similarityScore(score)
                .metaData(meta)
                .build();
    }

    private List<Document> retrieveRelevantDocuments(
            @NotBlank String query,
            UUID documentId,
            Integer topK,
            Double similaritySearch) {

        int effectiveTopK =
                (topK != null && topK > 0)
                        ? topK
                        : appProperties.getRag().getTopK();

        double effectiveThreshold =
                (similaritySearch != null)
                        ? similaritySearch
                        : appProperties.getRag().getSimilarityThreshold();

        SearchRequest.Builder searchRequestBuilder = SearchRequest.builder()
                .query(query)
                .topK(effectiveTopK);

        if (effectiveThreshold > 0.0) {
            searchRequestBuilder.similarityThreshold(effectiveThreshold);
        }

        if (documentId != null) {
            FilterExpressionBuilder builder = new FilterExpressionBuilder();

            searchRequestBuilder.filterExpression(
                    builder.eq("documentId", documentId.toString()).build()
            );
        }

        try {
            List<Document> documents = vectorStore.similaritySearch(
                    searchRequestBuilder.build()
            );


            for (Document document : documents) {
                Map<String, Object> metadata = document.getMetadata();

                logger.info(
                        "Retrieved chunk: id={}, documentId={}, chunkIndex={}",
                        document.getId(),
                        metadata.get("documentId"),
                        metadata.get("chunkIndex")
                );

                if (documentId != null &&
                        !documentId.toString().equals(
                                String.valueOf(metadata.get("documentId")))) {
                    logger.error(
                            "Document scope mismatch: expected={}, actual={}",
                            documentId,
                            metadata.get("documentId")
                    );
                }
            }


            logger.info(
                    "Retrieved {} chunks for query '{}' (Scoped Docid: {})",
                    documents.size(),
                    query,
                    documentId
            );

            return documents;

        } catch (Exception e) {
            logger.error("Similarity search failed for query: {}", query, e);
            throw new IllegalStateException("Document retrieval failed", e);
        }
    }

}
