package DocMind.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponseDTO {

    private String answer;
    private String conversationId;
    private List<CitationDTO> citations;
    private Long responseTimeMs;

}
