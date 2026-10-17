package DocMind.backend.DTO;

import lombok.*;
import org.w3c.dom.stylesheets.LinkStyle;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResultDTO {

    private String query;
    private int totalMatches;
    private List<CitationDTO> matches;

}



