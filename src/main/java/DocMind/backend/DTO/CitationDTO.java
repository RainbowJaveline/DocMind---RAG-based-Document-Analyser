package DocMind.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CitationDTO {
    private UUID id;
    private String fileName;
    private Integer chunkIndex;
    private Integer pageNumber;
    private String snippet;
    private Double similarityScore;
    private Map<String , Object> metaData;
}
