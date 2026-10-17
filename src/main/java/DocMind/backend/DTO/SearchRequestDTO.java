package DocMind.backend.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchRequestDTO {
    @NotBlank
    private String query;
    private UUID documentId;
    private Integer topK;
    private Double similaritySearch;
}
