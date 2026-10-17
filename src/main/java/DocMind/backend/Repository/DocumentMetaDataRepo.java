package DocMind.backend.Repository;

import DocMind.backend.Entity.DocumentMetadata;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DocumentMetaDataRepo extends JpaRepository<DocumentMetadata, UUID> {

}
