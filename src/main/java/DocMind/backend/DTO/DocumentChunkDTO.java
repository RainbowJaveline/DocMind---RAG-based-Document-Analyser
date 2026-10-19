package DocMind.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentChunkDTO {

    private String id;
    private Integer chunkIndex;
    private Integer pageNumber;
    private String snippet;
    private Map<String, Object> metadata;
}