package DocMind.backend.DTO;

import DocMind.backend.Entity.DocumentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DocumentResponseDTO {
    private UUID id;
    private String fileName;
    private Long fileSize;
    private DocumentStatus status;
    private Integer chunkCreated;
    private Integer totalPages;
    private String message;
    @Builder.Default
    private List<DocumentChunkDTO> chunks = List.of();
}
