package DocMind.backend.config;

import jakarta.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {

    private RagProperties rag = new RagProperties();
    private CorsProperties cors = new CorsProperties();



    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RagProperties{
        private int chunkSize=700;
        //private int chunkOverlap=100;
        private int minChunkLengthToEmbed=5;
        private int maxNumChunks= 10000;
        private int minChunkSizeChar = 350;
        private int topK=5;
        private double similarityThreshold=0.0;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CorsProperties{
        private String allowedOrigin="*";
        private String allowedMethods="GET,POST,PUT,DELETE";
        private String allowedHeaders="*";
    }
}
