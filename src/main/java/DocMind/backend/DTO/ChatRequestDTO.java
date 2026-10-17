package DocMind.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequestDTO {

    private String question;
    private UUID documentId;
    private Integer topK;
    private Double minSimilarity;
    private String conversationId;

}

