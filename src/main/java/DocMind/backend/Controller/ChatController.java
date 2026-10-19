package DocMind.backend.Controller;

import DocMind.backend.DTO.*;
import DocMind.backend.Service.RagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import javax.naming.directory.SearchResult;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@Tag(
        name = "Chat Management",
        description = "Chat client controller"
)
@RequiredArgsConstructor
@RequestMapping("api/v1/chat")
public class ChatController {

    private final RagService ragService;

    @PostMapping("/query")
    @Operation(
            summary = "Asks question against all the document or a specific document"
    )
    public ResponseEntity<ApiResponse<ChatResponseDTO>> askQuestion(
            @RequestBody ChatRequestDTO request
            ){

        ChatResponseDTO chatResponse = ragService.askQuestion(request);
        return ResponseEntity.ok(
                ApiResponse.<ChatResponseDTO>builder()
                        .message("Answer is Processed")
                        .success(Boolean.TRUE)
                        .data(chatResponse)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PostMapping(value = "/stream" , produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Stream real-time Q&A answers tokens using Server-Sent Events (SSE)")
    public Flux<String> streamQuestion(@Valid @RequestBody ChatRequestDTO request){
        return ragService.streamQuestionAnswer(request);
    }

    @PostMapping("/search/similarity")
    @Operation(summary = "Perform semantic similarity search on stored document vectors")
    public ResponseEntity<ApiResponse<SearchResultDTO>> similaritySearch(
            @Valid @RequestBody SearchRequestDTO request
    ){
        DocMind.backend.DTO.SearchResultDTO searchResultDTO = ragService.similarChunks(request);
        return ResponseEntity.ok(
                ApiResponse.<SearchResultDTO>builder()
                        .message("Similar Chunks are Found")
                        .success(true)
                        .data(searchResultDTO)
                        .build()
        );
    }
}

