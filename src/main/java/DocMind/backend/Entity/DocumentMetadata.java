package DocMind.backend.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name="document_metadata")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(unique = false)
    private String filename;
    @Column(nullable = false)
    private String contentType;
    private Long size;
    private Integer totalPages;
    private Integer totalChunks;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentStatus status;
    @Column(length = 1000)
    private String errorMessage;
    @Column(nullable = false , updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
